import pytesseract
from PIL import Image

def extract_text_from_image(image_path):
    """
    Extracts text from an image using Tesseract OCR.
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        if not text.strip():
            text = "⚠ No readable text found in image."
        return text
    except Exception as e:
        raise Exception(f"OCR extraction failed: {e}")