from collections import deque
from datetime import datetime
import os
import re
from typing import Dict, List

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

from utils.ocr import extract_text_from_image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
CATEGORY_LABELS = [
    "Travel",
    "Food",
    "Lodging",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Office Supplies",
    "Miscellaneous"
]
RECENT_UPLOAD_LIMIT = 25

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

try:
    zero_shot_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
except Exception as classification_error:
    zero_shot_classifier = None
    print("Zero-shot classifier unavailable:", classification_error)

try:
    ner_pipeline = pipeline("ner", aggregation_strategy="simple")
except Exception as ner_error:
    ner_pipeline = None
    print("NER pipeline unavailable:", ner_error)

try:
    sentiment_pipeline = pipeline("sentiment-analysis")
except Exception as sentiment_error:
    sentiment_pipeline = None
    print("Sentiment pipeline unavailable:", sentiment_error)

recent_uploads = deque(maxlen=RECENT_UPLOAD_LIMIT)
all_expenses = []


def extract_amount(text: str) -> float:
    amounts = re.findall(r'\$?\s*(\d+\.?\d*)', text)
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
            if entity['entity_group'] == 'ORG':
                vendor = entity['word']
                break
        
        amount = extract_amount(text)
        return {"vendor": vendor, "date": "", "total": amount}
    except Exception as e:
        print(f"Entity extraction error: {e}")
        return {"vendor": "", "date": "", "total": extract_amount(text)}


def classify_text(text: str) -> Dict[str, float]:
    if zero_shot_classifier is None:
        return {"label": "Uncategorized", "score": 0.0}
    cleaned_text = text.strip()
    if not cleaned_text:
        return {"label": "Uncategorized", "score": 0.0}
    truncated_text = cleaned_text[:512]
    result = zero_shot_classifier(truncated_text, CATEGORY_LABELS)
    labels = result.get("labels", [])
    scores = result.get("scores", [])
    if not labels or not scores:
        return {"label": "Uncategorized", "score": 0.0}
    return {"label": labels[0], "score": float(scores[0])}


@app.route('/')
def home():
    return jsonify({'status': 'success', 'message': '✅ Transparency-AI OCR backend is running successfully!'})


@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        text = extract_text_from_image(filepath)
        classification = classify_text(text)
        entities = extract_entities(text)
        
        entry = {
            'file': file.filename,
            'uploadedAt': datetime.utcnow().isoformat() + 'Z',
            'status': 'Processed' if text else 'Needs Review',
            'category': classification['label'],
            'confidence': classification['score'],
            'textPreview': text[:200],
            'vendor': entities['vendor'],
            'total': entities['total']
        }
        recent_uploads.appendleft(entry)
        all_expenses.append(entry)
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'text': text,
            'classification': classification,
            'entities': entities
        })
    except Exception as error:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(error)}), 500


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    try:
        classification = classify_text(text)
        entities = extract_entities(text)
        
        response = {
            'success': True,
            'text': text,
            'classification': classification,
            'entities': entities,
            'length': len(text)
        }
        
        return jsonify(response)
    except Exception as error:
        return jsonify({'error': str(error)}), 500


@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    try:
        classification = classify_text(text)
        return jsonify({'success': True, 'classification': classification})
    except Exception as error:
        return jsonify({'error': str(error)}), 500


@app.route('/entities', methods=['POST'])
def entities():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    try:
        entities_result = extract_entities(text)
        return jsonify({'success': True, 'entities': entities_result})
    except Exception as error:
        return jsonify({'error': str(error)}), 500


@app.route('/recent-uploads', methods=['GET'])
def get_recent_uploads():
    return jsonify({
        'success': True,
        'uploads': list(recent_uploads),
        'count': len(recent_uploads)
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'ocr': 'available',
        'classifier': 'available' if zero_shot_classifier else 'unavailable',
        'ner': 'available' if ner_pipeline else 'unavailable',
        'sentiment': 'available' if sentiment_pipeline else 'unavailable'
    })


@app.route('/expenses', methods=['GET'])
def get_expenses():
    return jsonify({
        'success': True,
        'expenses': all_expenses,
        'count': len(all_expenses)
    })


@app.route('/expenses/by-category', methods=['GET'])
def get_expenses_by_category():
    category_data = {}
    
    for expense in all_expenses:
        category = expense.get('category', 'Uncategorized')
        if category not in category_data:
            category_data[category] = {
                'total': 0,
                'count': 0,
                'expenses': []
            }
        category_data[category]['total'] += expense.get('total', 0)
        category_data[category]['count'] += 1
        category_data[category]['expenses'].append(expense)
    
    return jsonify({
        'success': True,
        'by_category': category_data
    })


@app.route('/expenses/stats', methods=['GET'])
def get_expenses_stats():
    total_amount = sum(e.get('total', 0) for e in all_expenses)
    category_totals = {}
    
    for expense in all_expenses:
        category = expense.get('category', 'Uncategorized')
        category_totals[category] = category_totals.get(category, 0) + expense.get('total', 0)
    
    category_percentages = {}
    for cat, amount in category_totals.items():
        category_percentages[cat] = round((amount / total_amount * 100) if total_amount > 0 else 0, 2)
    
    stats = {
        'success': True,
        'total_expenses': len(all_expenses),
        'total_amount': round(total_amount, 2),
        'by_category': category_totals,
        'category_percentages': category_percentages
    }
    
    return jsonify(stats)


if __name__ == "__main__":
<<<<<<< HEAD
    app.run(host="127.0.0.1", port=5000, debug=True)
=======
    app.run(host="127.0.0.1", port=5000, debug=True)
>>>>>>> 5d9f49f810b56c723a2db7bcb6c8408960d36b27
