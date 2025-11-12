from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from backend.utils.ocr import extract_text_from_image

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can call API

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

    print("Received file:", file.filename)

    try:
        text = extract_text_from_image(filepath)
        os.remove(filepath)  # cleanup
        return jsonify({'text': text})
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
