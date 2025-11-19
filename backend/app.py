from collections import deque
from datetime import datetime
import os
import re
from typing import Dict
from uuid import uuid4

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from transformers import pipeline

from utils.ocr import extract_text_from_image
from utils.classifier import load_categories, classify_text

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ------------------------
# File Serving Route FIXED
# ------------------------

@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_uploads(filename):
    """Serve uploaded files properly"""
    try:
        return send_from_directory('uploads', filename)
    except Exception:
        return jsonify({"error": "File not found"}), 404


UPLOAD_FOLDER = "uploads"
LOGO_FOLDER = os.path.join(UPLOAD_FOLDER, "logos")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_LOGO_SIZE = 5 * 1024 * 1024  # 5MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ------------------------
# Database Models
# ------------------------
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(100))
    vendor = db.Column(db.String(255))
    amount = db.Column(db.Float)
    text_preview = db.Column(db.Text)
    status = db.Column(db.String(50), default="Processed")
    anomaly_status = db.Column(db.String(50), default="normal")
    anomaly_reason = db.Column(db.Text, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "file": self.filename,
            "uploadedAt": self.uploaded_at.isoformat() + "Z",
            "category": self.category,
            "vendor": self.vendor,
            "total": self.amount,
            "textPreview": self.text_preview,
            "status": self.status,
            "anomalyStatus": self.anomaly_status,
            "anomalyReason": self.anomaly_reason
        }


class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.String(100), default="default")

    display_name = db.Column(db.String(255))
    email = db.Column(db.String(255))

    organization_name = db.Column(db.String(255))
    industry = db.Column(db.String(100))
    logo_path = db.Column(db.String(255))

    contact_info = db.Column(db.Text)
    help_content = db.Column(db.Text)

    ai_enabled = db.Column(db.Boolean, default=True)
    ai_response_tone = db.Column(db.String(50), default="professional")
    ai_accuracy_threshold = db.Column(db.Integer, default=95)

    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)
    expense_alerts = db.Column(db.Boolean, default=True)
    weekly_reports = db.Column(db.Boolean, default=True)

    theme = db.Column(db.String(20), default="dark")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "userId": self.user_id,
            "profile": {
                "displayName": self.display_name,
                "email": self.email
            },
            "organisation": {
                "name": self.organization_name,
                "industry": self.industry,
                "logoPath": self.logo_path
            },
            "contact": {
                "info": self.contact_info
            },
            "help": {
                "content": self.help_content
            },
            "ai": {
                "enabled": self.ai_enabled,
                "responseTone": self.ai_response_tone,
                "accuracyThreshold": self.ai_accuracy_threshold
            },
            "notifications": {
                "email": self.email_notifications,
                "push": self.push_notifications,
                "expenseAlerts": self.expense_alerts,
                "weeklyReports": self.weekly_reports
            },
            "preferences": {
                "theme": self.theme
            },
            "createdAt": self.created_at.isoformat() + "Z" if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() + "Z" if self.updated_at else None
        }


class AnomalyDetection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
    anomaly_type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Float, default=0.0)
    description = db.Column(db.Text)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="Pending")

    def to_dict(self):
        expense = Expense.query.get(self.expense_id)
        return {
            "id": self.id,
            "expenseId": self.expense_id,
            "dateTime": expense.uploaded_at.isoformat() + "Z" if expense else None,
            "vendorName": expense.vendor if expense else "",
            "category": expense.category if expense else "",
            "amount": expense.amount if expense else 0,
            "anomalyType": self.anomaly_type,
            "severity": self.severity,
            "confidence": self.confidence,
            "description": self.description,
            "detectedAt": self.detected_at.isoformat() + "Z" if self.detected_at else None,
            "status": self.status
        }


# ------------------------
# Load NLP Models
# ------------------------
try:
    ner_pipeline = pipeline("ner", aggregation_strategy="simple")
except Exception:
    ner_pipeline = None

try:
    sentiment_pipeline = pipeline("sentiment-analysis")
except Exception:
    sentiment_pipeline = None

# Limit recent uploads
RECENT_UPLOAD_LIMIT = 20
recent_uploads = deque(maxlen=RECENT_UPLOAD_LIMIT)


# ------------------------
# Helper Functions
# ------------------------
def extract_amount(text: str) -> float:
    """Extract the total amount from receipt text using multiple strategies."""

    # Convert to uppercase for easier matching
    text_upper = text.upper()

    # Look for lines containing total amounts
    lines = text_upper.split('\n')

    # Strategy 1: Look for lines with "TOTAL" and extract the amount
    total_patterns = [
        r'TOTAL[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'AMOUNT DUE[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'GRAND TOTAL[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'FINAL TOTAL[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'BALANCE DUE[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)'
    ]

    for pattern in total_patterns:
        matches = re.findall(pattern, text_upper)
        if matches:
            # Clean the amount (remove commas) and convert to float
            amount_str = matches[0].replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                continue

    # Strategy 2: Find all monetary amounts and return the largest one
    # More comprehensive regex for amounts
    amount_pattern = r'\$?(\d+(?:,\d{3})*(?:\.\d{1,2})?)'
    all_amounts = re.findall(amount_pattern, text)

    if all_amounts:
        # Convert to floats, filter out obviously wrong amounts (like years, phone numbers, etc.)
        valid_amounts = []
        for amt_str in all_amounts:
            amt_str = amt_str.replace(',', '')
            try:
                amt = float(amt_str)
                # Filter: amounts should be reasonable (not too large, not zero, not obviously wrong)
                if 0.01 <= amt <= 10000.0:  # Reasonable range for receipts
                    valid_amounts.append(amt)
            except ValueError:
                continue

        if valid_amounts:
            # Return the largest amount (usually the total)
            return max(valid_amounts)

    # Strategy 3: Fallback to original simple regex
    amounts = re.findall(r"\$?\s*(\d+\.?\d*)", text)
    if amounts:
        try:
            # Clean and convert
            amount_str = amounts[0].replace(',', '').strip()
            return float(amount_str)
        except ValueError:
            pass

    return 0.0


def extract_entities(text: str) -> Dict:
    amount = extract_amount(text)
    vendor = extract_vendor(text)

    return {"vendor": vendor, "date": "", "total": amount}


def extract_vendor(text: str) -> str:
    """Extract vendor name from receipt text using multiple heuristics."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Remove empty lines and very short lines
    lines = [line for line in lines if len(line) > 2]

    if not lines:
        return ""

    # Try NER first if available
    if ner_pipeline is not None:
        try:
            entities = ner_pipeline(text[:512])
            for entity in entities:
                if entity["entity_group"] == "ORG":
                    vendor_name = entity["word"].strip()
                    if len(vendor_name) > 2:  # Filter out very short names
                        return vendor_name
        except Exception:
            pass

    # Fallback heuristics for vendor extraction
    potential_vendors = []

    # Look for lines that are likely business names (all caps, title case, etc.)
    for i, line in enumerate(lines[:10]):  # Check first 10 lines
        line = line.strip()

        # Skip common receipt headers/footers
        skip_words = ['RECEIPT', 'INVOICE', 'CASH', 'CHANGE', 'TOTAL', 'SUBTOTAL', 'TAX', 'DATE', 'TIME', 'THANK YOU', 'CUSTOMER', 'SALESPERSON']
        if any(skip_word in line.upper() for skip_word in skip_words):
            continue

        # Look for lines that look like business names
        if (line.isupper() and len(line) > 3 and len(line) < 50) or \
           (line.istitle() and len(line) > 3 and len(line) < 50) or \
           (any(char.isupper() for char in line) and len(line) > 3 and len(line) < 50):
            # Clean up the line
            cleaned = re.sub(r'[^\w\s&\-\.]', '', line).strip()
            if cleaned and len(cleaned) > 2:
                potential_vendors.append(cleaned)

    # Return the first potential vendor found
    if potential_vendors:
        return potential_vendors[0]

    # Last resort: return first non-empty line
    return lines[0] if lines else ""


def detect_anomalies(expense_id: int, amount: float, vendor: str, category: str, uploaded_at) -> list:
    """Detect anomalies in the expense and create AnomalyDetection records"""
    anomalies = []
    
    try:
        all_expenses = Expense.query.all()
        
        if len(all_expenses) <= 1:
            return anomalies
        
        similar_category_expenses = [e for e in all_expenses if e.category == category and e.id != expense_id]
        
        if similar_category_expenses:
            amounts = [e.amount for e in similar_category_expenses if e.amount > 0]
            
            if amounts:
                avg_amount = sum(amounts) / len(amounts)
                max_amount = max(amounts)
                min_amount = min(amounts)
                std_dev = (sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)) ** 0.5 if len(amounts) > 1 else 0
                
                if std_dev > 0:
                    z_score = abs((amount - avg_amount) / std_dev)
                else:
                    z_score = abs(amount - avg_amount) / (avg_amount + 1)
                
                if z_score > 2:
                    anomaly = AnomalyDetection(
                        expense_id=expense_id,
                        anomaly_type="Unusual Amount",
                        severity="Critical" if z_score > 3 else "High" if z_score > 2.5 else "Medium",
                        confidence=min(95, 50 + (z_score * 10)),
                        description=f"Transaction amount ${amount:.2f} deviates significantly from category average ${avg_amount:.2f}",
                        status="Pending"
                    )
                    anomalies.append(anomaly)
                
                if amount > (max_amount * 1.5):
                    anomaly = AnomalyDetection(
                        expense_id=expense_id,
                        anomaly_type="Unusual Amount",
                        severity="High",
                        confidence=85,
                        description=f"Transaction amount ${amount:.2f} exceeds typical spending pattern (max: ${max_amount:.2f})",
                        status="Pending"
                    )
                    if not any(a.anomaly_type == "Unusual Amount" for a in anomalies):
                        anomalies.append(anomaly)
        
        duplicate_expense = Expense.query.filter(
            Expense.vendor == vendor,
            Expense.amount == amount,
            Expense.category == category,
            Expense.id != expense_id,
            Expense.uploaded_at >= (uploaded_at - db.func.cast(db.literal('1 day'), db.Interval))
        ).first()
        
        if duplicate_expense:
            anomaly = AnomalyDetection(
                expense_id=expense_id,
                anomaly_type="Duplicate Detection",
                severity="High",
                confidence=90,
                description=f"Potential duplicate: Similar transaction found for {vendor} on {duplicate_expense.uploaded_at.strftime('%Y-%m-%d')}",
                status="Pending"
            )
            anomalies.append(anomaly)
        
        known_vendors = set(e.vendor.lower() for e in all_expenses if e.vendor)
        if vendor.lower() not in known_vendors and len(known_vendors) > 0:
            vendor_count = len([e for e in all_expenses if e.vendor.lower() == vendor.lower()])
            
            if vendor_count == 1:
                anomaly = AnomalyDetection(
                    expense_id=expense_id,
                    anomaly_type="Unknown Vendor",
                    severity="Low",
                    confidence=70,
                    description=f"Vendor '{vendor}' not found in previous transaction history",
                    status="Pending"
                )
                anomalies.append(anomaly)
        
        for anomaly in anomalies:
            db.session.add(anomaly)
        
        if anomalies:
            db.session.commit()
    
    except Exception as e:
        print(f"Error detecting anomalies: {str(e)}")
    
    return anomalies


# ------------------------
# Routes
# ------------------------
@app.route("/")
def home():
    return jsonify({"status": "success", "message": "Transparency-AI backend running"})


@app.route("/ocr", methods=["POST"])
def ocr():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        text = extract_text_from_image(filepath)
        category = classify_text(text)
        entities = extract_entities(text)

        expense = Expense(
            filename=file.filename,
            category=category,
            vendor=entities["vendor"],
            amount=entities["total"],
            text_preview=text[:200],
            status="Processed" if text else "Needs Review"
        )

        db.session.add(expense)
        db.session.commit()

        detect_anomalies(expense.id, entities["total"], entities["vendor"], category, expense.uploaded_at)

        recent_uploads.appendleft(expense.to_dict())

        os.remove(filepath)

        return jsonify({
            "success": True,
            "text": text,
            "classification": {"label": category, "score": 0.0},
            "entities": entities,
            "anomalyStatus": anomaly_status,
            "anomalyReason": anomaly_reason
        })

    except Exception as error:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(error)}), 500


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]

    try:
        category = classify_text(text)
        entities = extract_entities(text)

        return jsonify({
            "success": True,
            "text": text,
            "classification": {"label": category, "score": 0.0},
            "entities": entities,
            "length": len(text)
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/recent-uploads", methods=["GET"])
def recent_uploads_api():
    try:
        uploads = Expense.query.order_by(Expense.uploaded_at.desc()).limit(20).all()
        return jsonify({"success": True, "uploads": [e.to_dict() for e in uploads]})
    except Exception as e:
        return jsonify({"error": f"Failed to get recent uploads: {str(e)}"}), 500


@app.route("/expenses", methods=["GET"])
def get_expenses():
    expenses = Expense.query.all()
    return jsonify({
        "success": True,
        "expenses": [e.to_dict() for e in expenses],
        "count": len(expenses)
    })


@app.route("/expenses/non-anomalous", methods=["GET"])
def get_non_anomalous_expenses():
    try:
        expenses = Expense.query.all()
        anomalies = AnomalyDetection.query.all()
        
        anomalous_expense_ids = set(a.expense_id for a in anomalies)
        
        non_anomalous = [
            e.to_dict() for e in expenses 
            if e.id not in anomalous_expense_ids
        ]
        
        return jsonify({
            "success": True,
            "expenses": non_anomalous,
            "count": len(non_anomalous)
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get non-anomalous expenses: {str(e)}"}), 500


@app.route("/expenses/stats", methods=["GET"])
def get_expenses_stats():
    try:
        expenses = Expense.query.all()

        # Calculate total stats
        total_expenses = len(expenses)
        total_amount = sum(expense.amount for expense in expenses)

        # Calculate by category
        by_category = {}
        for expense in expenses:
            category = expense.category
            if category not in by_category:
                by_category[category] = 0
            by_category[category] += expense.amount

        # Calculate category percentages
        category_percentages = {}
        if total_amount > 0:
            for category, amount in by_category.items():
                percentage = round((amount / total_amount) * 100, 1)
                # Ensure minimum 1% visibility for all categories
                if percentage <= 0:
                    percentage = 1.0
                category_percentages[category] = percentage

        return jsonify({
            "success": True,
            "total_expenses": total_expenses,
            "total_amount": total_amount,
            "by_category": by_category,
            "category_percentages": category_percentages
        })

    except Exception as e:
        return jsonify({"error": f"Failed to get expense stats: {str(e)}"}), 500


@app.route("/expenses/by-category", methods=["GET"])
def get_expenses_by_category():
    try:
        expenses = Expense.query.all()

        # Group expenses by category
        categories = {}
        for expense in expenses:
            category = expense.category
            if category not in categories:
                categories[category] = {
                    "total": 0,
                    "count": 0,
                    "expenses": []
                }

            categories[category]["total"] += expense.amount
            categories[category]["count"] += 1
            categories[category]["expenses"].append(expense.to_dict())

        return jsonify({
            "success": True,
            "by_category": categories
        })

    except Exception as e:
        return jsonify({"error": f"Failed to get expenses by category: {str(e)}"}), 500


@app.route("/expenses/trends", methods=["GET"])
def get_monthly_trends():
    try:
        from collections import defaultdict
        from datetime import datetime

        expenses = Expense.query.all()

        # Group expenses by month and category
        monthly_data = defaultdict(lambda: defaultdict(float))

        for expense in expenses:
            # Extract month-year from uploaded_at
            month_year = expense.uploaded_at.strftime("%Y-%m") if expense.uploaded_at else "2024-11"
            monthly_data[month_year][expense.category] += expense.amount

        # Convert to list format for frontend
        trends_data = []
        for month_year, categories in sorted(monthly_data.items()):
            month_name = datetime.strptime(month_year, "%Y-%m").strftime("%b")
            data_point = {"month": month_name}

            # Add all categories for this month
            for category, amount in categories.items():
                data_point[category] = amount

            trends_data.append(data_point)

        # If no data, provide some default structure
        if not trends_data:
            trends_data = [
                {"month": "Nov", "Entertainment": 0, "Pharmacy": 0, "Telecommunications": 0}
            ]

        return jsonify({
            "success": True,
            "trends": trends_data
        })

    except Exception as e:
        return jsonify({"error": f"Failed to get monthly trends: {str(e)}"}), 500


@app.route("/anomalies", methods=["GET"])
def get_anomalies():
    try:
        anomalies = Expense.query.filter_by(anomaly_status="flagged").all()
        normal = Expense.query.filter_by(anomaly_status="normal").all()
        
        stats = {
            "flagged_count": len(anomalies),
            "normal_count": len(normal),
            "flagged_percentage": round((len(anomalies) / (len(anomalies) + len(normal)) * 100), 2) if (len(anomalies) + len(normal)) > 0 else 0
        }
        
        return jsonify({
            "success": True,
            "anomalies": [e.to_dict() for e in anomalies],
            "stats": stats
        })
    
    except Exception as e:
        return jsonify({"error": f"Failed to get anomalies: {str(e)}"}), 500


@app.route("/anomalies/recheck/<int:expense_id>", methods=["POST"])
def recheck_anomaly(expense_id):
    try:
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({"error": "Expense not found"}), 404
        
        anomaly_status, anomaly_reason = detect_anomaly(expense)
        expense.anomaly_status = anomaly_status
        expense.anomaly_reason = anomaly_reason
        db.session.commit()
        
        return jsonify({
            "success": True,
            "anomalyStatus": anomaly_status,
            "anomalyReason": anomaly_reason,
            "expense": expense.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to recheck anomaly: {str(e)}"}), 500


# ------------------------
# Anomaly Detection
# ------------------------
@app.route("/anomalies", methods=["GET"])
def get_anomalies():
    try:
        anomalies = AnomalyDetection.query.all()
        return jsonify({
            "success": True,
            "anomalies": [a.to_dict() for a in anomalies],
            "count": len(anomalies)
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get anomalies: {str(e)}"}), 500


@app.route("/anomalies/stats", methods=["GET"])
def get_anomalies_stats():
    try:
        anomalies = AnomalyDetection.query.all()
        
        total_anomalies = len(anomalies)
        severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        anomaly_types = {}
        
        for anomaly in anomalies:
            severity_counts[anomaly.severity] = severity_counts.get(anomaly.severity, 0) + 1
            atype = anomaly.anomaly_type
            anomaly_types[atype] = anomaly_types.get(atype, 0) + 1
        
        avg_confidence = sum(a.confidence for a in anomalies) / len(anomalies) if anomalies else 0
        
        expenses = Expense.query.all()
        flagged_count = len(set(a.expense_id for a in anomalies))
        
        return jsonify({
            "success": True,
            "totalCharges": sum(e.amount for e in expenses),
            "anomalousTransactions": total_anomalies,
            "flaggedExpenses": flagged_count,
            "detectionAccuracy": min(100, 70 + (avg_confidence * 0.3)),
            "severityCounts": severity_counts,
            "anomalyTypes": anomaly_types,
            "averageConfidence": avg_confidence
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get anomaly stats: {str(e)}"}), 500


@app.route("/anomalies/by-severity", methods=["GET"])
def get_anomalies_by_severity():
    try:
        anomalies = AnomalyDetection.query.all()
        by_severity = {"Critical": [], "High": [], "Medium": [], "Low": []}
        
        for anomaly in anomalies:
            severity = anomaly.severity
            if severity in by_severity:
                by_severity[severity].append(anomaly.to_dict())
        
        return jsonify({
            "success": True,
            "by_severity": by_severity
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get anomalies by severity: {str(e)}"}), 500


@app.route("/anomalies/recent", methods=["GET"])
def get_recent_anomalies():
    try:
        limit = request.args.get("limit", 10, type=int)
        anomalies = AnomalyDetection.query.order_by(AnomalyDetection.detected_at.desc()).limit(limit).all()
        
        return jsonify({
            "success": True,
            "anomalies": [a.to_dict() for a in anomalies],
            "count": len(anomalies)
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get recent anomalies: {str(e)}"}), 500


# ------------------------
# Settings (GET & PUT)
# ------------------------
@app.route("/settings/<role>", methods=["GET"])
def get_settings(role):
    if role not in ["admin", "auditor", "employee"]:
        return jsonify({"error": "Invalid role"}), 400

    settings = UserSettings.query.filter_by(role=role).first()

    if not settings:
        settings = UserSettings(
            role=role,
            display_name=f"{role.title()} User",
            email=f"{role}@example.com"
        )
        if role == "admin":
            settings.organization_name = "Default Organization"
            settings.industry = "technology"

        db.session.add(settings)
        db.session.commit()

    return jsonify({"success": True, "settings": settings.to_dict()})


@app.route("/settings/<role>", methods=["PUT"])
def update_settings(role):
    if role not in ["admin", "auditor", "employee"]:
        return jsonify({"error": "Invalid role"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        settings = UserSettings.query.filter_by(role=role).first()

        if not settings:
            settings = UserSettings(role=role)
            db.session.add(settings)

        # PROFILE
        if "profile" in data:
            p = data["profile"]
            settings.display_name = p.get("displayName", settings.display_name)
            settings.email = p.get("email", settings.email)

        # ORG SETTINGS ADMIN ONLY
        if role == "admin" and "organisation" in data:
            org = data["organisation"]
            settings.organization_name = org.get("name", settings.organization_name)
            settings.industry = org.get("industry", settings.industry)

        # AI SETTINGS
        if "ai" in data:
            ai = data["ai"]
            settings.ai_enabled = ai.get("enabled", settings.ai_enabled)
            settings.ai_response_tone = ai.get("responseTone", settings.ai_response_tone)
            settings.ai_accuracy_threshold = ai.get("accuracyThreshold", settings.ai_accuracy_threshold)

        # NOTIFICATION SETTINGS
        if "notifications" in data:
            n = data["notifications"]
            settings.email_notifications = n.get("email", settings.email_notifications)
            settings.push_notifications = n.get("push", settings.push_notifications)
            settings.expense_alerts = n.get("expenseAlerts", settings.expense_alerts)
            settings.weekly_reports = n.get("weeklyReports", settings.weekly_reports)

        # PREFERENCES
        if "preferences" in data:
            pref = data["preferences"]
            settings.theme = pref.get("theme", settings.theme)

        # CONTACT INFO ADMIN ONLY
        if role == "admin" and "contact" in data:
            settings.contact_info = data["contact"].get("info", settings.contact_info)

        # HELP CONTENT ADMIN ONLY
        if role == "admin" and "help" in data:
            settings.help_content = data["help"].get("content", settings.help_content)

        db.session.commit()

        return jsonify({"success": True, "settings": settings.to_dict()})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update settings: {str(e)}"}), 500


# ------------------------
# Logo Upload
# ------------------------
@app.route("/settings/<role>/upload-logo", methods=["POST"])
def upload_logo(role):
    try:
        if role != "admin":
            return jsonify({"error": "Only admins can upload logos"}), 403

        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file format"}), 400

        size = len(file.read())
        if size > MAX_LOGO_SIZE:
            file.seek(0)
            return jsonify({"error": "File too large (max 5MB)"}), 400

        file.seek(0)

        settings = UserSettings.query.filter_by(role=role).first()
        if not settings:
            settings = UserSettings(role=role)
            db.session.add(settings)

        filename = f"{uuid4()}_{secure_filename(file.filename)}"
        filepath = os.path.join(LOGO_FOLDER, filename)
        file.save(filepath)

        settings.logo_path = f"uploads/logos/{filename}"
        db.session.commit()

        return jsonify({"success": True, "logoPath": settings.logo_path})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ------------------------
# DB Migration
# ------------------------
def migrate_database():
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        
        user_settings_cols = [c["name"] for c in inspector.get_columns("user_settings")]
        expense_cols = [c["name"] for c in inspector.get_columns("expense")]

        needed = False

        if "logo_path" not in user_settings_cols:
            db.session.execute(text("ALTER TABLE user_settings ADD COLUMN logo_path VARCHAR(255)"))
            needed = True

        if "contact_info" not in user_settings_cols:
            db.session.execute(text("ALTER TABLE user_settings ADD COLUMN contact_info TEXT"))
            needed = True

        if "help_content" not in user_settings_cols:
            db.session.execute(text("ALTER TABLE user_settings ADD COLUMN help_content TEXT"))
            needed = True

        if "anomaly_status" not in expense_cols:
            db.session.execute(text("ALTER TABLE expense ADD COLUMN anomaly_status VARCHAR(50) DEFAULT 'normal'"))
            needed = True

        if "anomaly_reason" not in expense_cols:
            db.session.execute(text("ALTER TABLE expense ADD COLUMN anomaly_reason TEXT DEFAULT ''"))
            needed = True

        if needed:
            db.session.commit()

    except Exception as e:
        print("Migration skipped:", e)
        db.session.rollback()


# ------------------------
# Run Backend
# ------------------------
# ------------------------
# Run Backend
# ------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        try:
            migrate_database()
        except:
            pass

    app.run(host="127.0.0.1", port=5000, debug=True)
