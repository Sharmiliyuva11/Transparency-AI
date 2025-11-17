from collections import deque
from datetime import datetime
import os
import re
from typing import Dict

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from transformers import pipeline

from utils.ocr import extract_text_from_image
from utils.classifier import load_categories, classify_text

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

UPLOAD_FOLDER = "uploads"
FINAL_CATEGORY_LIST = load_categories()
RECENT_UPLOAD_LIMIT = 25

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ------------------------
# Database Model
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
# Run App
# ------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="127.0.0.1", port=5000, debug=True)
