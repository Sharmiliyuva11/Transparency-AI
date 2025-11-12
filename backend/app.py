from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils.ocr import extract_text_from_image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


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
    print(f"📥 Received file: {file.filename}")

    try:
        text = extract_text_from_image(filepath)
        os.remove(filepath)  # clean up after processing
        return jsonify({'text': text})
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        print("❌ Error in OCR:", e)
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
