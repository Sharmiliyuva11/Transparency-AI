import pytesseract
from PIL import Image
import os
def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using Tesseract OCR."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"File not found: {image_path}")

    try:
        image = Image.open(image_path)
        image = image.convert('L')  # Convert to grayscale for better accuracy
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR processing failed: {str(e)}")