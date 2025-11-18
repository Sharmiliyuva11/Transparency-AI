import requests
import json

BASE_URL = "http://127.0.0.1:5000"

print("Testing Settings API...")
print("\n1. Testing GET /settings/admin")
response = requests.get(f"{BASE_URL}/settings/admin")
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

print("\n2. Testing PUT /settings/admin")
update_data = {
    "profile": {
        "displayName": "Updated Admin Name",
        "email": "updated@company.com"
    },
    "organisation": {
        "name": "Updated Tech Corp",
        "industry": "finance"
    },
    "ai": {
        "enabled": True,
        "responseTone": "professional",
        "accuracyThreshold": 98
    },
    "notifications": {
        "email": True,
        "push": True,
        "expenseAlerts": True,
        "weeklyReports": True
    },
    "preferences": {
        "theme": "dark"
    }
}

response = requests.put(f"{BASE_URL}/settings/admin", json=update_data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

print("\n3. Verifying changes with GET /settings/admin")
response = requests.get(f"{BASE_URL}/settings/admin")
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
