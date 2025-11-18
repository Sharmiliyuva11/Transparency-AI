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

@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded files"""
    try:
        return send_from_directory('uploads', filename)
    except Exception as e:
        return jsonify({"error": "File not found"}), 404

UPLOAD_FOLDER = "uploads"
LOGO_FOLDER = os.path.join(UPLOAD_FOLDER, "logos")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_LOGO_SIZE = 5 * 1024 * 1024  # 5MB
FINAL_CATEGORY_LIST = load_categories()
RECENT_UPLOAD_LIMIT = 25

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(LOGO_FOLDER, exist_ok=True)


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
    role = db.Column(db.String(50), nullable=False)  # 'admin', 'auditor', 'employee'
    user_id = db.Column(db.String(100), default="default")  # For future multi-user support

    # Profile settings
    display_name = db.Column(db.String(255))
    email = db.Column(db.String(255))

    # Organisation settings (admin only)
    organization_name = db.Column(db.String(255))
    industry = db.Column(db.String(100))
    logo_path = db.Column(db.String(255))  # Path to uploaded logo

    # Contact & Help (admin only)
    contact_info = db.Column(db.Text)  # Contact information
    help_content = db.Column(db.Text)  # Help/documentation content

    # AI settings
    ai_enabled = db.Column(db.Boolean, default=True)
    ai_response_tone = db.Column(db.String(50), default="professional")  # professional, friendly, casual
    ai_accuracy_threshold = db.Column(db.Integer, default=95)

    # Notification settings
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)
    expense_alerts = db.Column(db.Boolean, default=True)
    weekly_reports = db.Column(db.Boolean, default=True)

    # App preferences
    theme = db.Column(db.String(20), default="dark")  # dark, light, auto

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


recent_uploads = deque(maxlen=RECENT_UPLOAD_LIMIT)


# ------------------------
# Helper Functions
# ------------------------
def extract_amount(text: str) -> float:
    amounts = re.findall(r"\$?\s*(\d+\.?\d*)", text)
    if amounts:
        try:
            return float(amounts[0])
        except ValueError:
            return 0.0
    return 0.0


def extract_entities(text: str) -> Dict:
    if ner_pipeline is None:
        return {"vendor": "", "date": "", "total": 0.0}

    try:
        entities = ner_pipeline(text[:512])
        vendor = ""

        for entity in entities:
            if entity["entity_group"] == "ORG":
                vendor = entity["word"]
                break

        amount = extract_amount(text)

        return {"vendor": vendor, "date": "", "total": amount}

    except Exception:
        return {"vendor": "", "date": "", "total": extract_amount(text)}


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


@app.route("/classify", methods=["POST"])
def classify_api():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]

    try:
        predicted_category = classify_text(text)
        return jsonify({
            "predicted_category": predicted_category,
            "all_categories": FINAL_CATEGORY_LIST
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/entities", methods=["POST"])
def entities_api():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    try:
        return jsonify({
            "success": True,
            "entities": extract_entities(data["text"])
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


@app.route("/expenses/by-category", methods=["GET"])
def expenses_by_category():
    expenses = Expense.query.all()
    category_data = {}

    for e in expenses:
        cat = e.category or "Uncategorized"
        if cat not in category_data:
            category_data[cat] = {"total": 0, "count": 0, "expenses": []}

        category_data[cat]["total"] += e.amount or 0
        category_data[cat]["count"] += 1
        category_data[cat]["expenses"].append(e.to_dict())

    return jsonify({"success": True, "by_category": category_data})


@app.route("/expenses/stats", methods=["GET"])
def expenses_stats():
    expenses = Expense.query.all()
    total = sum(e.amount or 0 for e in expenses)

    category_totals = {}
    for e in expenses:
        cat = e.category or "Uncategorized"
        category_totals[cat] = category_totals.get(cat, 0) + (e.amount or 0)

    percentages = {
        cat: round((amt / total) * 100, 2) if total > 0 else 0
        for cat, amt in category_totals.items()
    }

    return jsonify({
        "success": True,
        "total_expenses": len(expenses),
        "total_amount": round(total, 2),
        "by_category": category_totals,
        "category_percentages": percentages
    })


# ------------------------
# Settings Routes
# ------------------------
@app.route("/settings/<role>", methods=["GET"])
def get_settings(role):
    """Get settings for a specific role"""
    if role not in ["admin", "auditor", "employee"]:
        return jsonify({"error": "Invalid role"}), 400

    settings = UserSettings.query.filter_by(role=role).first()

    if not settings:
        # Create default settings if they don't exist
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
    """Update settings for a specific role"""
    if role not in ["admin", "auditor", "employee"]:
        return jsonify({"error": "Invalid role"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        settings = UserSettings.query.filter_by(role=role).first()

        if not settings:
            # Create new settings if they don't exist
            settings = UserSettings(role=role)
            db.session.add(settings)

        # Update profile settings
        if "profile" in data:
            profile = data["profile"]
            if "displayName" in profile:
                settings.display_name = profile["displayName"]
            if "email" in profile:
                settings.email = profile["email"]

        # Update organisation settings (admin only)
        if role == "admin" and "organisation" in data:
            org = data["organisation"]
            if "name" in org:
                settings.organization_name = org["name"]
            if "industry" in org:
                settings.industry = org["industry"]

        # Update AI settings
        if "ai" in data:
            ai = data["ai"]
            if "enabled" in ai:
                settings.ai_enabled = ai["enabled"]
            if "responseTone" in ai:
                settings.ai_response_tone = ai["responseTone"]
            if "accuracyThreshold" in ai:
                settings.ai_accuracy_threshold = ai["accuracyThreshold"]

        # Update notification settings
        if "notifications" in data:
            notifications = data["notifications"]
            if "email" in notifications:
                settings.email_notifications = notifications["email"]
            if "push" in notifications:
                settings.push_notifications = notifications["push"]
            if "expenseAlerts" in notifications:
                settings.expense_alerts = notifications["expenseAlerts"]
            if "weeklyReports" in notifications:
                settings.weekly_reports = notifications["weeklyReports"]

        # Update app preferences
        if "preferences" in data:
            preferences = data["preferences"]
            if "theme" in preferences:
                settings.theme = preferences["theme"]

        # Update contact info (admin only)
        if role == "admin" and "contact" in data:
            contact = data["contact"]
            if "info" in contact:
                settings.contact_info = contact["info"]

        # Update help content (admin only)
        if role == "admin" and "help" in data:
            help_data = data["help"]
            if "content" in help_data:
                settings.help_content = help_data["content"]

        db.session.commit()

        return jsonify({"success": True, "settings": settings.to_dict()})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating settings: {str(e)}")
        return jsonify({"error": f"Failed to update settings: {str(e)}"}), 500


@app.route("/settings/<role>/upload-logo", methods=["POST"])
def upload_logo(role):
    """Upload organization logo"""
    try:
        if role not in ["admin", "auditor", "employee"]:
            return jsonify({"error": "Invalid role"}), 400

        if role != "admin":
            return jsonify({"error": "Only admins can upload logos"}), 403

        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file format. Allowed: png, jpg, jpeg, gif, webp"}), 400

        file_size = len(file.read())
        if file_size > MAX_LOGO_SIZE:
            file.seek(0)
            return jsonify({"error": f"File too large. Maximum size: 5MB (your file: {file_size/1024/1024:.2f}MB)"}), 400

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

        return jsonify({"success": True, "logoPath": settings.logo_path, "settings": settings.to_dict()})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error uploading logo: {str(e)}")
        return jsonify({"error": f"Failed to upload logo: {str(e)}"}), 500


# ------------------------
# Database Migration
# ------------------------
def migrate_database():
    """Add new columns to existing database if they don't exist"""
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('user_settings')]
        
        needs_commit = False
        if 'logo_path' not in columns:
            db.session.execute(text('ALTER TABLE user_settings ADD COLUMN logo_path VARCHAR(255)'))
            print("Added logo_path column")
            needs_commit = True
        if 'contact_info' not in columns:
            db.session.execute(text('ALTER TABLE user_settings ADD COLUMN contact_info TEXT'))
            print("Added contact_info column")
            needs_commit = True
        if 'help_content' not in columns:
            db.session.execute(text('ALTER TABLE user_settings ADD COLUMN help_content TEXT'))
            print("Added help_content column")
            needs_commit = True
        
        if needs_commit:
            db.session.commit()
    except Exception as e:
        print(f"Migration note: {e}")
        db.session.rollback()
        pass


# ------------------------
# Run App
# ------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        try:
            migrate_database()
        except Exception as e:
            print(f"Migration skipped: {e}")

    app.run(host="127.0.0.1", port=5000, debug=True)
