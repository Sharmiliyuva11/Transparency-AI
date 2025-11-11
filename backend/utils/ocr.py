import pytesseract
from PIL import Image
import os

# Set Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_image(image_path: str) -> str:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"File not found: {image_path}")

    try:
        image = Image.open(image_path)
        image = image.convert('L')  # grayscale for better OCR
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR processing failed: {str(e)}")
