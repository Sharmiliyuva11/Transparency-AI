from collections import deque
from datetime import datetime, timedelta
import os
import re
from typing import Dict
from uuid import uuid4

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
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

    def to_dict(self):
        return {
            "id": self.id,
            "file": self.filename,
            "uploadedAt": self.uploaded_at.isoformat() + "Z",
            "category": self.category,
            "vendor": self.vendor,
            "total": self.amount,
            "textPreview": self.text_preview,
            "status": self.status
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


class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.Column(db.String(255), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text)
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'))
    ip_address = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M") if self.timestamp else None,
            "user": self.user,
            "action": self.action,
            "actionType": self.action_type,
            "details": self.details,
            "expenseId": self.expense_id,
            "ipAddress": self.ip_address
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="employee")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "role": self.role,
            "createdAt": self.created_at.isoformat() + "Z" if self.created_at else None
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
        r'TOTAL[:\s]\$?(\d+(?:,\d{3})(?:\.\d{2})?)',
        r'AMOUNT DUE[:\s]\$?(\d+(?:,\d{3})(?:\.\d{2})?)',
        r'GRAND TOTAL[:\s]\$?(\d+(?:,\d{3})(?:\.\d{2})?)',
        r'FINAL TOTAL[:\s]\$?(\d+(?:,\d{3})(?:\.\d{2})?)',
        r'BALANCE DUE[:\s]\$?(\d+(?:,\d{3})(?:\.\d{2})?)'
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
            
            for anomaly in anomalies:
                activity = ActivityLog(
                    user="System",
                    action="Anomaly Detected",
                    action_type="flagged",
                    details=f"{anomaly.anomaly_type}: {anomaly.description}",
                    expense_id=expense_id,
                    ip_address="system"
                )
                db.session.add(activity)
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

        activity = ActivityLog(
            user=request.headers.get('X-User-Name', 'Unknown User'),
            action="Uploaded Receipt",
            action_type="uploaded",
            details=f"{entities['vendor']} - ${entities['total']}",
            expense_id=expense.id,
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()

        detect_anomalies(expense.id, entities["total"], entities["vendor"], category, expense.uploaded_at)

        recent_uploads.appendleft(expense.to_dict())

        os.remove(filepath)

        return jsonify({
            "success": True,
            "text": text,
            "classification": {"label": category, "score": 0.0},
            "entities": entities
        })

    except Exception as error:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(error)}), 500


# ----------------
# Authentication Routes
# ----------------

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        email = data.get("email", "").strip()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        role = data.get("role", "employee").lower()
        
        if not email or not username or not password:
            return jsonify({"success": False, "error": "Email, username, and password are required"}), 400
        
        if len(password) < 6:
            return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400
        
        existing_user_email = User.query.filter_by(email=email).first()
        if existing_user_email:
            return jsonify({"success": False, "error": "Email already registered"}), 400
        
        existing_user_username = User.query.filter_by(username=username).first()
        if existing_user_username:
            return jsonify({"success": False, "error": "Username already taken"}), 400
        
        if role not in ["admin", "employee", "auditor"]:
            role = "employee"
        
        user = User(email=email, username=username, role=role)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Account created successfully",
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        
        if not email or not password:
            return jsonify({"success": False, "error": "Email and password are required"}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


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
    return jsonify({"success": True, "uploads": list(recent_uploads)})


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
# Admin Reports API
# ------------------------
@app.route("/api/categories", methods=["GET"])
def get_categories():
    try:
        expenses = Expense.query.all()
        categories = sorted(set(e.category for e in expenses if e.category))
        return jsonify({
            "success": True,
            "categories": categories
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get categories: {str(e)}"}), 500


@app.route("/api/admin/reports", methods=["GET"])
def get_admin_reports():
    try:
        category_filter = request.args.get("category", None)
        expenses = Expense.query.all()
        
        if category_filter and category_filter != "All Categories":
            expenses = [e for e in expenses if e.category == category_filter]
        
        anomalies = AnomalyDetection.query.all()
        
        total_expenses = len(expenses)
        total_amount = sum(e.amount for e in expenses) if expenses else 0
        
        by_category = {}
        for expense in expenses:
            category = expense.category
            if category not in by_category:
                by_category[category] = 0
            by_category[category] += expense.amount
        
        category_spending_data = [
            {"category": cat, "amount": amt} 
            for cat, amt in by_category.items()
        ]
        
        from collections import defaultdict
        monthly_data = defaultdict(lambda: defaultdict(float))
        
        for expense in expenses:
            month_year = expense.uploaded_at.strftime("%Y-%m") if expense.uploaded_at else "2024-11"
            monthly_data[month_year][expense.category] += expense.amount
        
        expense_trend_data = []
        for month_year in sorted(monthly_data.keys()):
            month_name = datetime.strptime(month_year, "%Y-%m").strftime("%b")
            amount = sum(monthly_data[month_year].values())
            expense_trend_data.append({"month": month_name, "amount": amount})
        
        average_per_transaction = (total_amount / total_expenses) if total_expenses > 0 else 0
        
        anomalous_expense_ids = set(a.expense_id for a in anomalies)
        flagged_items = len(anomalous_expense_ids)
        
        compliance_rate = ((total_expenses - flagged_items) / total_expenses * 100) if total_expenses > 0 else 100
        compliance_rate = round(min(100, max(0, compliance_rate)), 1)
        
        ai_insights = [
            {
                "id": "insight-1",
                "type": "Spending Insight",
                "severity": "Info",
                "message": f"Total expenses tracked: {len(expenses)} receipts with ${total_amount:.2f} spending."
            }
        ]
        
        if flagged_items > 0:
            ai_insights.append({
                "id": "insight-2",
                "type": "Anomaly Alert",
                "severity": "Alert",
                "message": f"Detected {flagged_items} flagged transaction(s) across all categories. Manual review recommended."
            })
        
        if compliance_rate >= 95:
            ai_insights.append({
                "id": "insight-3",
                "type": "Compliance Status",
                "severity": "Success",
                "message": f"Compliance rate is {compliance_rate}%. {int(compliance_rate)}% of submitted expenses meet standards."
            })
        
        if category_spending_data:
            top_category = max(category_spending_data, key=lambda x: x["amount"])
            ai_insights.append({
                "id": "insight-4",
                "type": "Recommendation",
                "severity": "Warning",
                "message": f"'{top_category['category']}' is your highest spending category at ${top_category['amount']:.2f}. Consider optimizing these expenses."
            })
        
        return jsonify({
            "success": True,
            "totalExpenses": total_amount,
            "complianceRate": compliance_rate,
            "averagePerTransaction": round(average_per_transaction, 2),
            "flaggedItems": flagged_items,
            "expenseTrendData": expense_trend_data,
            "aiInsights": ai_insights
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get reports: {str(e)}"}), 500


@app.route("/api/auditor/reports", methods=["GET"])
def get_auditor_reports():
    try:
        from collections import defaultdict
        
        category_filter = request.args.get("category", None)
        date_range = request.args.get("dateRange", "All Time")
        
        expenses = Expense.query.all()
        
        date_cutoff = None
        if date_range == "Last 3 Months":
            date_cutoff = datetime.utcnow() - timedelta(days=90)
        elif date_range == "Last 5 Months":
            date_cutoff = datetime.utcnow() - timedelta(days=150)
        elif date_range == "Last Year":
            date_cutoff = datetime.utcnow() - timedelta(days=365)
        
        if date_cutoff:
            expenses = [e for e in expenses if e.uploaded_at and e.uploaded_at >= date_cutoff]
        
        if category_filter and category_filter != "All Categories":
            expenses = [e for e in expenses if e.category == category_filter]
        
        anomalies = AnomalyDetection.query.all()
        
        if date_cutoff:
            anomalies = [a for a in anomalies if a.detected_at and a.detected_at >= date_cutoff]
        
        total_transactions = len(expenses)
        total_amount = sum(e.amount for e in expenses) if expenses else 0
        
        by_category = defaultdict(float)
        for expense in expenses:
            by_category[expense.category] += expense.amount
        
        category_spending_data = [
            {"category": cat, "amount": round(amt, 2)} 
            for cat, amt in sorted(by_category.items(), key=lambda x: x[1], reverse=True)
        ]
        
        monthly_data = defaultdict(lambda: defaultdict(float))
        
        for expense in expenses:
            month_year = expense.uploaded_at.strftime("%Y-%m") if expense.uploaded_at else "2024-11"
            monthly_data[month_year][expense.category] += expense.amount
        
        expense_trend_data = []
        for month_year in sorted(monthly_data.keys()):
            month_name = datetime.strptime(month_year, "%Y-%m").strftime("%b %y")
            amount = sum(monthly_data[month_year].values())
            expense_trend_data.append({"month": month_name, "amount": round(amount, 2)})
        
        average_per_transaction = (total_amount / total_transactions) if total_transactions > 0 else 0
        
        anomalous_expense_ids = set(a.expense_id for a in anomalies)
        flagged_items = len(anomalous_expense_ids)
        
        compliance_rate = ((total_transactions - flagged_items) / total_transactions * 100) if total_transactions > 0 else 100
        compliance_rate = round(min(100, max(0, compliance_rate)), 1)
        
        flagged_amount = sum(e.amount for e in expenses if e.id in anomalous_expense_ids)
        
        anomaly_types = defaultdict(int)
        severity_counts = defaultdict(int)
        for anomaly in anomalies:
            if anomaly.expense_id in [e.id for e in expenses]:
                anomaly_types[anomaly.anomaly_type] += 1
                severity_counts[anomaly.severity] += 1
        
        fraud_detection_data = [
            {"category": atype, "count": count, "fill": "#ff6b6b" if count > 0 else "#cccccc"} 
            for atype, count in anomaly_types.items()
        ]
        
        if not fraud_detection_data:
            fraud_detection_data = [
                {"category": "Duplicates", "count": 0, "fill": "#cccccc"},
                {"category": "Unusual Pattern", "count": 0, "fill": "#cccccc"},
                {"category": "Missing Info", "count": 0, "fill": "#cccccc"}
            ]
        
        ai_insights = []
        
        ai_insights.append({
            "id": "insight-1",
            "type": "Spending Pattern",
            "severity": "Info",
            "message": f"Analyzed {total_transactions} receipt(s) totaling ${total_amount:.2f} with average transaction of ${average_per_transaction:.2f}."
        })
        
        if total_transactions > 0 and category_spending_data:
            top_category = category_spending_data[0]
            category_percentage = (top_category["amount"] / total_amount * 100) if total_amount > 0 else 0
            ai_insights.append({
                "id": "insight-2",
                "type": "Spending Insight",
                "severity": "Info",
                "message": f"'{top_category['category']}' dominates spending at ${top_category['amount']:.2f} ({category_percentage:.1f}% of total). Consider vendor negotiation opportunities."
            })
        
        if flagged_items > 0:
            flag_percentage = (flagged_items / total_transactions * 100) if total_transactions > 0 else 0
            severity = "Alert" if flag_percentage > 10 else "Warning"
            ai_insights.append({
                "id": "insight-3",
                "type": "Anomaly Alert",
                "severity": severity,
                "message": f"Detected {flagged_items} anomalies ({flag_percentage:.1f}% of transactions) totaling ${flagged_amount:.2f}. Priority review required."
            })
        else:
            ai_insights.append({
                "id": "insight-3",
                "type": "Compliance Status",
                "severity": "Success",
                "message": f"All {total_transactions} transactions passed validation checks. No anomalies detected."
            })
        
        if compliance_rate >= 95:
            ai_insights.append({
                "id": "insight-4",
                "type": "Compliance Status",
                "severity": "Success",
                "message": f"Excellent compliance rate of {compliance_rate}%. Only {flagged_items} items require review."
            })
        elif compliance_rate >= 80:
            ai_insights.append({
                "id": "insight-4",
                "type": "Compliance Status",
                "severity": "Warning",
                "message": f"Compliance rate is {compliance_rate}%. Recommend reviewing {flagged_items} flagged transactions."
            })
        else:
            ai_insights.append({
                "id": "insight-4",
                "type": "Compliance Alert",
                "severity": "Alert",
                "message": f"Compliance rate below threshold at {compliance_rate}%. Immediate action needed for {flagged_items} items."
            })
        
        if expense_trend_data:
            amounts = [d["amount"] for d in expense_trend_data]
            if len(amounts) > 1:
                trend_change = ((amounts[-1] - amounts[0]) / amounts[0] * 100) if amounts[0] > 0 else 0
                if trend_change > 15:
                    ai_insights.append({
                        "id": "insight-5",
                        "type": "Spending Trend",
                        "severity": "Warning",
                        "message": f"Spending increased by {trend_change:.1f}% from period start. Monitor for budget overruns."
                    })
                elif trend_change < -15:
                    ai_insights.append({
                        "id": "insight-5",
                        "type": "Spending Trend",
                        "severity": "Success",
                        "message": f"Spending decreased by {abs(trend_change):.1f}% from period start. Cost control measures effective."
                    })
        
        if category_spending_data and len(category_spending_data) > 1:
            top_two = category_spending_data[:2]
            if top_two[0]["amount"] > top_two[1]["amount"] * 2:
                ai_insights.append({
                    "id": "insight-6",
                    "type": "Recommendation",
                    "severity": "Warning",
                    "message": f"High concentration in '{top_two[0]['category']}'. Diversify vendors to reduce dependency risk."
                })
        
        return jsonify({
            "success": True,
            "totalExpenses": total_amount,
            "complianceRate": compliance_rate,
            "averagePerTransaction": round(average_per_transaction, 2),
            "flaggedItems": flagged_items,
            "flaggedAmount": round(flagged_amount, 2),
            "expenseTrendData": expense_trend_data,
            "categorySpendingData": category_spending_data,
            "fraudDetectionData": fraud_detection_data,
            "aiInsights": ai_insights
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get auditor reports: {str(e)}"}), 500


@app.route("/api/admin/users", methods=["GET"])
def get_admin_users():
    try:
        users = UserSettings.query.filter_by(role="employee").all()
        
        total_users = len(users)
        admin_users = len(UserSettings.query.filter_by(role="admin").all())
        auditor_users = len(UserSettings.query.filter_by(role="auditor").all())
        
        user_list = [
            {
                "id": str(u.user_id or u.id),
                "name": u.display_name or "Unknown",
                "email": u.email or "no-email@example.com",
                "department": u.industry or "General",
                "role": "User",
                "status": "Active",
                "joinedDate": u.created_at.isoformat() if u.created_at else "2024-01-01T00:00:00"
            }
            for u in users
        ]
        
        role_permissions = {
            "admin": [
                "View all expenses organization-wide",
                "Approve/reject flagged transactions",
                "Access audit logs",
                "Generate and export reports",
                "Configure system settings"
            ],
            "user": [
                "Submit expense receipts",
                "View personal expense history",
                "Track approval status",
                "Edit personal profile"
            ],
            "auditor": [
                "Read-only access to all data",
                "View all dashboards and reports",
                "Generate compliance reports",
                "Verify transaction legitimacy"
            ]
        }
        
        return jsonify({
            "success": True,
            "adminUsersCount": admin_users,
            "staffEmployeesCount": total_users,
            "auditorsCount": auditor_users,
            "users": user_list,
            "rolePermissions": role_permissions
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get users: {str(e)}"}), 500


@app.route("/api/admin/users", methods=["POST"])
def create_new_user():
    try:
        data = request.get_json()
        
        if not data or not data.get("name") or not data.get("email"):
            return jsonify({"error": "Name and email are required"}), 400
        
        existing_user = UserSettings.query.filter_by(email=data.get("email")).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 400
        
        new_user = UserSettings(
            role="employee",
            user_id=str(uuid4()),
            display_name=data.get("name"),
            email=data.get("email"),
            organization_name=data.get("organization", ""),
            industry=data.get("department", "General")
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User created successfully",
            "user": {
                "id": str(new_user.user_id),
                "name": new_user.display_name,
                "email": new_user.email,
                "department": new_user.industry,
                "role": "User",
                "status": "Active",
                "joinedDate": new_user.created_at.isoformat() if new_user.created_at else "2024-01-01T00:00:00"
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500


@app.route("/api/admin/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    try:
        data = request.get_json()
        user = UserSettings.query.filter_by(user_id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if "name" in data:
            user.display_name = data.get("name")
        if "email" in data:
            user.email = data.get("email")
        if "department" in data:
            user.industry = data.get("department")
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User updated successfully",
            "user": {
                "id": str(user.user_id),
                "name": user.display_name,
                "email": user.email,
                "department": user.industry,
                "role": "User",
                "status": "Active",
                "joinedDate": user.created_at.isoformat() if user.created_at else "2024-01-01T00:00:00"
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500


@app.route("/api/admin/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        user = UserSettings.query.filter_by(user_id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User deleted successfully"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500


@app.route("/api/admin/users/roles-permissions", methods=["GET"])
def get_role_permissions():
    role_permissions = {
        "admin": [
            "View all expenses organization-wide",
            "Approve/reject flagged transactions",
            "Access audit logs",
            "Generate and export reports",
            "Configure system settings"
        ],
        "user": [
            "Submit expense receipts",
            "View personal expense history",
            "Track approval status",
            "Edit personal profile"
        ],
        "auditor": [
            "Read-only access to all data",
            "View all dashboards and reports",
            "Generate compliance reports",
            "Verify transaction legitimacy"
        ]
    }
    
    return jsonify({
        "success": True,
        "rolePermissions": role_permissions
    })


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
# AI Insights
# ------------------------
@app.route("/api/admin/ai-insights", methods=["GET"])
def get_ai_insights():
    try:
        expenses = Expense.query.all()
        anomalies = AnomalyDetection.query.all()
        
        if not expenses:
            return jsonify({
                "success": True,
                "insights": []
            })
        
        insights = []
        
        amounts = [e.amount for e in expenses if e.amount > 0]
        vendors = {}
        categories = {}
        
        for expense in expenses:
            if expense.vendor:
                vendors[expense.vendor.lower()] = vendors.get(expense.vendor.lower(), 0) + 1
            if expense.category:
                categories[expense.category] = categories.get(expense.category, 0) + expense.amount
        
        total_amount = sum(amounts)
        avg_amount = total_amount / len(amounts) if amounts else 0
        
        if len(amounts) > 1:
            recent_amounts = sorted(amounts)[-5:]
            older_amounts = sorted(amounts)[:-5] if len(amounts) > 5 else amounts
            recent_avg = sum(recent_amounts) / len(recent_amounts)
            older_avg = sum(older_amounts) / len(older_amounts) if older_amounts else avg_amount
            
            if older_avg > 0:
                growth_rate = ((recent_avg - older_avg) / older_avg) * 100
                
                if growth_rate > 20:
                    insights.append({
                        "type": "anomaly",
                        "title": "Spending Increase Detected",
                        "description": f"Recent expenses average ${recent_avg:.2f} vs older expenses ${older_avg:.2f}. Your spending has increased by {growth_rate:.1f}% recently.",
                        "details": f"Recent average: ${recent_avg:.2f} | Previous average: ${older_avg:.2f}"
                    })
                elif growth_rate < -20:
                    insights.append({
                        "type": "recommendation",
                        "title": "Excellent Cost Control",
                        "description": f"You've successfully reduced spending by {abs(growth_rate):.1f}%. Keep maintaining this discipline with your expense management.",
                        "details": f"Recent average: ${recent_avg:.2f} | Previous average: ${older_avg:.2f}"
                    })
        
        if vendors:
            top_vendors = sorted(vendors.items(), key=lambda x: x[1], reverse=True)[:3]
            top_vendor_name = top_vendors[0][0].title() if top_vendors else "Unknown"
            top_vendor_count = top_vendors[0][1] if top_vendors else 0
            
            if top_vendor_count > 1:
                insights.append({
                    "type": "recommendation",
                    "title": "Top Vendor Opportunity",
                    "description": f"You've made {top_vendor_count} transactions with {top_vendor_name}. Consider negotiating bulk discounts or loyalty programs to reduce costs.",
                    "details": f"Vendor: {top_vendor_name} | Transactions: {top_vendor_count}"
                })
        
        documentation_complete = sum(1 for e in expenses if e.vendor and e.category and e.amount > 0)
        documentation_rate = (documentation_complete / len(expenses) * 100) if expenses else 0
        
        if documentation_rate >= 90:
            insights.append({
                "type": "recommendation",
                "title": "Excellent Documentation Quality",
                "description": f"Your documentation completeness is at {documentation_rate:.1f}%. All receipts are properly recorded with vendor, category, and amount information.",
                "details": f"Complete: {documentation_complete}/{len(expenses)} receipts"
            })
        elif documentation_rate < 70:
            insights.append({
                "type": "anomaly",
                "title": "Documentation Gap Detected",
                "description": f"Only {documentation_rate:.1f}% of receipts are complete. Please ensure all receipts include vendor name, category, and amount for better tracking.",
                "details": f"Complete: {documentation_complete}/{len(expenses)} receipts"
            })
        
        if categories:
            largest_category = max(categories.items(), key=lambda x: x[1])
            category_name = largest_category[0]
            category_amount = largest_category[1]
            category_percentage = (category_amount / total_amount * 100) if total_amount > 0 else 0
            
            if category_percentage > 40:
                insights.append({
                    "type": "recommendation",
                    "title": f"Largest Expense Category: {category_name}",
                    "description": f"{category_name} represents {category_percentage:.1f}% of your total spending (${category_amount:.2f}). Consider reviewing expenses in this category for optimization opportunities.",
                    "details": f"Category: {category_name} | Amount: ${category_amount:.2f}"
                })
        
        anomaly_count = len(anomalies)
        if anomaly_count > 0:
            high_severity = sum(1 for a in anomalies if a.severity in ["Critical", "High"])
            insights.append({
                "type": "anomaly",
                "title": f"{anomaly_count} Anomalies Detected",
                "description": f"Your system has detected {anomaly_count} potential anomalies in your expenses, with {high_severity} flagged as high severity. Review these carefully.",
                "details": f"High severity: {high_severity} | Total: {anomaly_count}"
            })
        else:
            insights.append({
                "type": "recommendation",
                "title": "Clean Expense Record",
                "description": "No anomalies detected in your expenses. Your spending patterns appear normal and consistent.",
                "details": f"Total transactions analyzed: {len(expenses)}"
            })
        
        return jsonify({
            "success": True,
            "insights": insights
        })
    
    except Exception as e:
        return jsonify({"error": f"Failed to generate insights: {str(e)}"}), 500


@app.route("/api/auditor/ai-insights", methods=["GET"])
def get_auditor_ai_insights():
    try:
        expenses = Expense.query.all()
        anomalies = AnomalyDetection.query.all()
        
        if not expenses:
            return jsonify({
                "success": True,
                "insights": [],
                "summary": {
                    "totalExpenses": 0,
                    "totalAmount": 0,
                    "flaggedCount": 0,
                    "cleanCount": 0
                }
            })
        
        insights = []
        
        amounts = [e.amount for e in expenses if e.amount > 0]
        vendors = {}
        categories = {}
        dates = {}
        
        for expense in expenses:
            if expense.vendor:
                vendors[expense.vendor.lower()] = vendors.get(expense.vendor.lower(), 0) + 1
            if expense.category:
                categories[expense.category] = categories.get(expense.category, 0) + expense.amount
            if expense.uploaded_at:
                date_str = expense.uploaded_at.strftime("%Y-%m-%d")
                dates[date_str] = dates.get(date_str, 0) + 1
        
        total_amount = sum(amounts)
        avg_amount = total_amount / len(amounts) if amounts else 0
        max_amount = max(amounts) if amounts else 0
        min_amount = min(amounts) if amounts else 0
        
        flagged_count = len(set(a.expense_id for a in anomalies))
        clean_count = len(expenses) - flagged_count
        
        insights.append({
            "type": "summary",
            "title": "Audit Summary Overview",
            "description": f"Total expenses reviewed: {len(expenses)}. Flagged for review: {flagged_count}. Clean transactions: {clean_count}.",
            "details": f"Total Amount: ${total_amount:.2f} | Average: ${avg_amount:.2f} | Range: ${min_amount:.2f} - ${max_amount:.2f}",
            "badge": "primary"
        })
        
        if anomalies:
            severity_breakdown = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
            anomaly_types_count = {}
            
            for anomaly in anomalies:
                severity_breakdown[anomaly.severity] = severity_breakdown.get(anomaly.severity, 0) + 1
                atype = anomaly.anomaly_type
                anomaly_types_count[atype] = anomaly_types_count.get(atype, 0) + 1
            
            high_critical_count = severity_breakdown["Critical"] + severity_breakdown["High"]
            
            insights.append({
                "type": "alert",
                "title": f"Critical Anomalies Detected: {severity_breakdown['Critical']}",
                "description": f"Critical: {severity_breakdown['Critical']} | High: {severity_breakdown['High']} | Medium: {severity_breakdown['Medium']} | Low: {severity_breakdown['Low']}. Immediate review required for critical items.",
                "details": f"Total flagged anomalies: {len(anomalies)}",
                "badge": "danger"
            })
            
            if anomaly_types_count:
                top_anomaly_type = max(anomaly_types_count.items(), key=lambda x: x[1])
                insights.append({
                    "type": "warning",
                    "title": f"Most Common Anomaly: {top_anomaly_type[0]}",
                    "description": f"The most frequently detected anomaly type is '{top_anomaly_type[0]}' occurring {top_anomaly_type[1]} times. Consider implementing preventive measures.",
                    "details": f"Anomaly breakdown: {', '.join([f'{k}: {v}' for k, v in sorted(anomaly_types_count.items(), key=lambda x: x[1], reverse=True)])}",
                    "badge": "warning"
                })
        
        if vendors:
            top_vendors = sorted(vendors.items(), key=lambda x: x[1], reverse=True)[:5]
            top_vendor_name = top_vendors[0][0].title()
            top_vendor_count = top_vendors[0][1]
            
            insights.append({
                "type": "info",
                "title": f"Top Vendors: {top_vendor_name}",
                "description": f"Most active vendor is '{top_vendor_name}' with {top_vendor_count} transactions. Top 5 vendors account for concentrated spending.",
                "details": f"Top vendors: {', '.join([f'{v[0].title()} ({v[1]})' for v in top_vendors])}",
                "badge": "info"
            })
        
        if categories:
            category_list = [(k, v, v/total_amount*100) for k, v in categories.items()]
            category_list.sort(key=lambda x: x[1], reverse=True)
            
            high_risk_categories = [c for c in category_list if c[2] > 30]
            if high_risk_categories:
                insights.append({
                    "type": "recommendation",
                    "title": f"High Concentration in {high_risk_categories[0][0]}",
                    "description": f"Category '{high_risk_categories[0][0]}' represents {high_risk_categories[0][2]:.1f}% of total spending (${high_risk_categories[0][1]:.2f}). Review for cost optimization.",
                    "details": f"Category breakdown: {', '.join([f'{c[0]} ({c[2]:.1f}%)' for c in category_list[:5]])}",
                    "badge": "secondary"
                })
        
        compliance_rate = (clean_count / len(expenses) * 100) if expenses else 0
        
        if compliance_rate >= 95:
            insights.append({
                "type": "success",
                "title": "Excellent Compliance Score",
                "description": f"Compliance rate of {compliance_rate:.1f}%. Only {flagged_count} transactions flagged out of {len(expenses)}. Organization demonstrates strong expense governance.",
                "details": f"Clean: {clean_count}/{len(expenses)} transactions",
                "badge": "success"
            })
        elif compliance_rate < 80:
            insights.append({
                "type": "alert",
                "title": "Low Compliance Rate",
                "description": f"Only {compliance_rate:.1f}% of transactions passed initial audit. {flagged_count} transactions require investigation.",
                "details": f"Flagged: {flagged_count}/{len(expenses)} transactions",
                "badge": "danger"
            })
        
        recent_expenses = sorted(expenses, key=lambda e: e.uploaded_at, reverse=True)[:10]
        if recent_expenses:
            recent_anomaly_count = sum(1 for e in recent_expenses for a in anomalies if a.expense_id == e.id)
            if recent_anomaly_count > 0:
                insights.append({
                    "type": "warning",
                    "title": "Recent Anomalies in Last 10 Submissions",
                    "description": f"{recent_anomaly_count} anomalies detected in the most recent 10 expense submissions. Pattern may indicate training or process gaps.",
                    "details": f"Recent flagged: {recent_anomaly_count}/10 latest transactions",
                    "badge": "warning"
                })
        
        return jsonify({
            "success": True,
            "insights": insights,
            "summary": {
                "totalExpenses": len(expenses),
                "totalAmount": round(total_amount, 2),
                "flaggedCount": flagged_count,
                "cleanCount": clean_count,
                "complianceRate": round(compliance_rate, 1),
                "averageAmount": round(avg_amount, 2)
            }
        })
    
    except Exception as e:
        return jsonify({"error": f"Failed to generate auditor insights: {str(e)}"}), 500


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
        cols = [c["name"] for c in inspector.get_columns("user_settings")]

        needed = False

        if "logo_path" not in cols:
            db.session.execute(text("ALTER TABLE user_settings ADD COLUMN logo_path VARCHAR(255)"))
            needed = True

        if "contact_info" not in cols:
            db.session.execute(text("ALTER TABLE user_settings ADD COLUMN contact_info TEXT"))
            needed = True

        if "help_content" not in cols:
            db.session.execute(text("ALTER TABLE user_settings ADD COLUMN help_content TEXT"))
            needed = True

        if needed:
            db.session.commit()

    except Exception as e:
        print("Migration skipped:", e)
        db.session.rollback()


# ------------------------
# Audit Trail & Activity Logs
# ------------------------
@app.route("/activity-logs", methods=["GET"])
def get_activity_logs():
    try:
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        activities = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(limit).offset(offset).all()
        total = ActivityLog.query.count()
        
        return jsonify({
            "success": True,
            "activities": [a.to_dict() for a in activities],
            "total": total,
            "count": len(activities)
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get activity logs: {str(e)}"}), 500


@app.route("/activity-logs/stats", methods=["GET"])
def get_activity_stats():
    try:
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)
        
        all_activities = ActivityLog.query.all()
        activities_30d = ActivityLog.query.filter(ActivityLog.timestamp >= thirty_days_ago).all()
        activities_7d = ActivityLog.query.filter(ActivityLog.timestamp >= seven_days_ago).all()
        
        action_counts = {}
        for activity in all_activities:
            action = activity.action
            action_counts[action] = action_counts.get(action, 0) + 1
        
        action_type_counts = {}
        for activity in activities_30d:
            action_type = activity.action_type
            action_type_counts[action_type] = action_type_counts.get(action_type, 0) + 1
        
        approvals = action_type_counts.get("approved", 0)
        flags = action_type_counts.get("flagged", 0) + action_type_counts.get("rejected", 0)
        reports = action_type_counts.get("generated", 0)
        uploads = action_type_counts.get("uploaded", 0)
        
        recent_activities = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(5).all()
        
        return jsonify({
            "success": True,
            "totalActivities": len(activities_30d),
            "last30Days": len(activities_30d),
            "approvals": approvals,
            "flagsRejections": flags,
            "reportsGenerated": reports,
            "uploads": uploads,
            "last7Reports": len([a for a in activities_7d if a.action_type == "generated"]),
            "actionCounts": action_counts,
            "actionTypeCounts": action_type_counts,
            "recentActivities": [a.to_dict() for a in recent_activities]
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get activity stats: {str(e)}"}), 500


@app.route("/audit-trail", methods=["GET"])
def get_audit_trail():
    try:
        limit = request.args.get('limit', 50, type=int)
        
        activities = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(limit).all()
        
        audit_trail = []
        for activity in activities:
            audit_trail.append({
                "id": activity.id,
                "title": activity.user,
                "action": activity.action,
                "detail": activity.details,
                "timestamp": activity.timestamp.strftime("%Y-%m-%d %H:%M - %I:%M %p") if activity.timestamp else None,
                "ipAddress": activity.ip_address,
                "actionType": activity.action_type
            })
        
        return jsonify({
            "success": True,
            "auditTrail": audit_trail,
            "count": len(audit_trail)
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get audit trail: {str(e)}"}), 500


@app.route("/dashboard/auditor-overview", methods=["GET"])
def get_auditor_overview():
    try:
        expenses = Expense.query.all()
        anomalies = AnomalyDetection.query.all()
        activities = ActivityLog.query.all()
        
        total_transactions = len(expenses)
        total_amount = sum(e.amount for e in expenses)
        
        anomalous_ids = set(a.expense_id for a in anomalies)
        flagged_count = len(anomalous_ids)
        
        compliance_violations = len([a for a in anomalies if a.severity in ["Critical", "High"]])
        
        compliance_rate = ((total_transactions - compliance_violations) / total_transactions * 100) if total_transactions > 0 else 0
        
        compliance_data = {
            "compliant": 100 - (compliance_violations / total_transactions * 100) if total_transactions > 0 else 100,
            "warning": 0,
            "violation": compliance_violations / total_transactions * 100 if total_transactions > 0 else 0
        }
        
        from collections import defaultdict
        monthly_data = defaultdict(lambda: {"verified": 0, "flagged": 0})
        
        for expense in expenses:
            month_year = expense.uploaded_at.strftime("%b") if expense.uploaded_at else "Nov"
            if expense.id in anomalous_ids:
                monthly_data[month_year]["flagged"] += 1
            else:
                monthly_data[month_year]["verified"] += 1
        
        review_stats = []
        months_order = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for month in months_order:
            if month in monthly_data:
                review_stats.append({
                    "month": month,
                    "verified": monthly_data[month]["verified"],
                    "flagged": monthly_data[month]["flagged"]
                })
        
        transactions_data = []
        for expense in expenses[:20]:
            status = "Flagged" if expense.id in anomalous_ids else "Verified" if expense.status == "Processed" else "Pending"
            transactions_data.append({
                "date": expense.uploaded_at.strftime("%Y-%m-%d") if expense.uploaded_at else "N/A",
                "user": "User " + str((expense.id % 10) + 1),
                "vendor": expense.vendor or "Unknown",
                "amount": f"${expense.amount}",
                "category": expense.category or "Other",
                "status": status,
                "aiFlag": "Flagged" if expense.id in anomalous_ids else "Clean"
            })
        
        recent_audit_trail = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(3).all()
        audit_trail_data = []
        for activity in recent_audit_trail:
            audit_trail_data.append({
                "title": activity.user,
                "action": activity.action,
                "detail": activity.details,
                "timestamp": activity.timestamp.strftime("%Y-%m-%d %H:%M - %I:%M %p") if activity.timestamp else None
            })
        
        return jsonify({
            "success": True,
            "totalTransactions": total_transactions,
            "complianceRate": round(compliance_rate, 1),
            "aiReviewedFlags": flagged_count,
            "policyViolations": compliance_violations,
            "complianceData": compliance_data,
            "reviewStats": review_stats,
            "transactions": transactions_data,
            "auditTrail": audit_trail_data
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get auditor overview: {str(e)}"}), 500


@app.route("/auditor/expenses", methods=["GET"])
def get_auditor_expenses():
    try:
        expenses = Expense.query.all()
        anomalies = AnomalyDetection.query.all()
        anomalous_ids = set(a.expense_id for a in anomalies)
        
        category_spending = {}
        category_expenses = {}
        
        for expense in expenses:
            category = expense.category or "Other"
            
            if category not in category_spending:
                category_spending[category] = {"amount": 0, "count": 0}
                category_expenses[category] = []
            
            category_spending[category]["amount"] += expense.amount
            category_spending[category]["count"] += 1
            
            status = "Flagged" if expense.id in anomalous_ids else "Verified"
            category_expenses[category].append({
                "date": expense.uploaded_at.strftime("%Y-%m-%d") if expense.uploaded_at else "N/A",
                "vendor": expense.vendor or "Unknown",
                "amount": expense.amount,
                "status": status
            })
        
        category_spending_cards = []
        for category, data in category_spending.items():
            category_spending_cards.append({
                "category": category,
                "amount": data["amount"],
                "change": "+1.6% vs last month"
            })
        
        spending_distribution = []
        total_amount = sum(e.amount for e in expenses) if expenses else 1
        for category, data in category_spending.items():
            percentage = (data["amount"] / total_amount * 100) if total_amount > 0 else 0
            spending_distribution.append({
                "category": category,
                "value": round(percentage, 1)
            })
        
        from collections import defaultdict
        category_trends = defaultdict(lambda: {})
        
        months_order = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for month in months_order:
            month_data = {"month": month}
            for category in category_spending.keys():
                month_data[category] = 0
            
            for expense in expenses:
                exp_month = expense.uploaded_at.strftime("%b") if expense.uploaded_at else "Nov"
                if exp_month == month:
                    category = expense.category or "Other"
                    if category in month_data:
                        month_data[category] = month_data.get(category, 0) + expense.amount
            
            category_trends[month] = month_data
        
        category_trends_list = [category_trends[month] for month in months_order if month in category_trends]
        
        return jsonify({
            "success": True,
            "categorySpending": category_spending_cards,
            "spendingDistribution": spending_distribution,
            "categoryTrends": category_trends_list,
            "categoryExpenses": category_expenses
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get auditor expenses: {str(e)}"}), 500


@app.route("/auditor/anomalies", methods=["GET"])
def get_auditor_anomalies():
    try:
        anomalies = AnomalyDetection.query.all()
        expenses = Expense.query.all()
        
        total_flagged = len(anomalies)
        pending_reviews = len([a for a in anomalies if a.status == "Pending"])
        approved_after_review = len([a for a in anomalies if a.status == "Approved"])
        
        ai_accuracy = 94.8 if total_flagged == 0 else round((approved_after_review / total_flagged) * 100, 1) if total_flagged > 0 else 94.8
        
        from collections import defaultdict
        anomalies_by_month = defaultdict(int)
        
        for anomaly in anomalies:
            expense = Expense.query.get(anomaly.expense_id)
            if expense and expense.uploaded_at:
                month = expense.uploaded_at.strftime("%b")
                anomalies_by_month[month] += 1
        
        months_order = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        anomalies_over_time = []
        for month in months_order:
            anomalies_over_time.append({
                "month": month,
                "count": anomalies_by_month.get(month, 0)
            })
        
        anomaly_type_counts = defaultdict(int)
        for anomaly in anomalies:
            anomaly_type_counts[anomaly.anomaly_type] += 1
        
        anomaly_reason_distribution = []
        type_to_reason = {
            "Unusual Amount": "Excessive Amount",
            "Duplicate Detection": "Duplicate",
            "Unknown Vendor": "Unusual Vendor",
            "Other": "Others"
        }
        
        colors = ["#ff6b6b", "#ffa94d", "#ff6b6b", "#ffa94d", "#99a5cc"]
        color_idx = 0
        total_anomalies = len(anomalies)
        
        for atype, count in anomaly_type_counts.items():
            reason = type_to_reason.get(atype, atype)
            percentage = round((count / total_anomalies * 100), 1) if total_anomalies > 0 else 0
            anomaly_reason_distribution.append({
                "name": reason,
                "value": percentage,
                "color": colors[color_idx % len(colors)]
            })
            color_idx += 1
        
        flagged_transactions = []
        for anomaly in anomalies[:20]:
            expense = Expense.query.get(anomaly.expense_id)
            if expense:
                severity_map = {"Critical": "high", "High": "high", "Medium": "medium", "Low": "low"}
                flagged_transactions.append({
                    "id": anomaly.id,
                    "date": expense.uploaded_at.strftime("%Y-%m-%d") if expense.uploaded_at else "N/A",
                    "user": "User " + str((expense.id % 10) + 1),
                    "vendor": expense.vendor or "Unknown",
                    "amount": f"${expense.amount:,.2f}",
                    "reason": anomaly.anomaly_type,
                    "severity": severity_map.get(anomaly.severity, "low"),
                    "confidence": int(anomaly.confidence) if anomaly.confidence else 80
                })
        
        explainability_data = []
        for anomaly in anomalies[:3]:
            expense = Expense.query.get(anomaly.expense_id)
            if expense:
                severity_map = {"Critical": "high", "High": "high", "Medium": "medium", "Low": "low"}
                explainability_data.append({
                    "id": anomaly.id,
                    "vendor": expense.vendor or "Unknown",
                    "amount": f"${expense.amount:,.2f}",
                    "severity": severity_map.get(anomaly.severity, "low"),
                    "title": anomaly.description or f"Anomaly: {anomaly.anomaly_type}",
                    "confidence": int(anomaly.confidence) if anomaly.confidence else 80
                })
        
        return jsonify({
            "success": True,
            "totalFlagged": total_flagged,
            "pendingReviews": pending_reviews,
            "approvedAfterReview": approved_after_review,
            "aiAccuracy": ai_accuracy,
            "anomaliesOverTime": anomalies_over_time,
            "reasonDistribution": anomaly_reason_distribution,
            "flaggedTransactions": flagged_transactions,
            "explainabilityData": explainability_data
        })
    except Exception as e:
        return jsonify({"error": f"Failed to get auditor anomalies: {str(e)}"}), 500


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