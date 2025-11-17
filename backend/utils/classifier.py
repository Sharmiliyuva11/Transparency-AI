import os
import json
from typing import List, Set
from transformers import pipeline

BASE_CATEGORIES = [
    "Travel",
    "Food",
    "Lodging",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Office Supplies",
    "Miscellaneous",
    "Groceries",
    "Healthcare",
    "Electronics",
    "Repair & Maintenance",
    "Fuel",
    "Clothing",
    "Online Services",
    "Banking & Finance",
    "Education",
    "Telecommunications",
    "Household Supplies",
    "Gifts & Donations",
    "Personal Care",
    "Hardware & Tools",
    "Professional Services",
    "Subscription Services",
    "Pharmacy",
    "Books & Stationery"
]

def load_dataset_categories() -> Set[str]:
    dataset_path = os.path.join("backend", "datasets", "Receipts dataset")
    categories = set()
    # Scan for CSV/JSON files
    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith(('.csv', '.json')):
                filepath = os.path.join(root, file)
                try:
                    if file.endswith('.json'):
                        with open(filepath, 'r') as f:
                            data = json.load(f)
                            # Assume data is list of dicts or dict with category field
                            if isinstance(data, list):
                                for item in data:
                                    if 'category' in item:
                                        categories.add(item['category'])
                            elif isinstance(data, dict) and 'category' in data:
                                categories.add(data['category'])
                    # For CSV, could use pandas, but to avoid dependency, skip or implement
                except:
                    pass
    # Also scan .txt files that are JSON
    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith('.txt'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                        if 'category' in data:
                            categories.add(data['category'])
                except:
                    pass
    return categories

def load_categories() -> List[str]:
    dataset_cats = load_dataset_categories()
    all_cats = set(BASE_CATEGORIES) | dataset_cats
    return sorted(list(all_cats))

FINAL_CATEGORY_LIST = load_categories()

try:
    zero_shot_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
except Exception:
    zero_shot_classifier = None

def clean_text(text: str) -> str:
    return text.strip().lower()

def classify_text(text: str) -> str:
    cleaned = clean_text(text)
    if not cleaned:
        return "Miscellaneous"
    if zero_shot_classifier:
        try:
            result = zero_shot_classifier(cleaned[:512], FINAL_CATEGORY_LIST)
            return result['labels'][0]
        except:
            pass
    # Fallback to keyword matching
    keywords = {
        "Food": ["restaurant", "cafe", "food", "meal", "dinner", "lunch", "eat"],
        "Groceries": ["grocery", "supermarket", "market", "store"],
        "Travel": ["flight", "hotel", "travel", "trip", "vacation"],
        "Transportation": ["taxi", "bus", "train", "uber", "lyft"],
        "Entertainment": ["movie", "cinema", "theater", "concert", "game"],
        "Utilities": ["electricity", "water", "gas", "internet", "phone"],
        "Healthcare": ["doctor", "hospital", "pharmacy", "medical", "health"],
        "Fuel": ["gas", "petrol", "fuel", "station"],
        "Clothing": ["clothes", "shirt", "pants", "dress", "shoe"],
        "Electronics": ["phone", "computer", "laptop", "tv", "electronic"],
        "Lodging": ["hotel", "motel", "inn", "lodging", "stay"],
        "Office Supplies": ["office", "supplies", "paper", "pen", "printer"],
        "Online Services": ["netflix", "amazon", "subscription", "online"],
        "Banking & Finance": ["bank", "atm", "fee", "finance"],
        "Education": ["school", "book", "course", "education"],
        "Telecommunications": ["phone", "mobile", "telecom"],
        "Household Supplies": ["household", "cleaning", "supplies"],
        "Gifts & Donations": ["gift", "donation", "charity"],
        "Personal Care": ["cosmetic", "beauty", "care", "salon"],
        "Hardware & Tools": ["hardware", "tool", "repair"],
        "Professional Services": ["lawyer", "consultant", "service"],
        "Subscription Services": ["subscription", "monthly", "service"],
        "Pharmacy": ["pharmacy", "drug", "medicine"],
        "Books & Stationery": ["book", "stationery", "paper"],
        "Repair & Maintenance": ["repair", "maintenance", "fix"],
        "Miscellaneous": []
    }
    for category, words in keywords.items():
        if any(word in cleaned for word in words):
            return category
    return "Miscellaneous"