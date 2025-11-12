from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils.ocr import extract_text_from_image  # ✅ Correct import

app = Flask(_name_)
CORS(app)  # Enable CORS for frontend communication

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def home():
    return "✅ Transparency-AI OCR backend is running successfully!"

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    print("📄 Received file:", file.filename)

    try:
        text = extract_text_from_image(filepath)
        os.remove(filepath)  # Clean up after processing
        return jsonify({'text': text})
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500

if _name_ == '_main_':
    app.run(debug=True, port=5000)