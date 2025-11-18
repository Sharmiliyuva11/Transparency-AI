import requests
import json

# Test GET settings
print("Testing GET /settings/admin")
response = requests.get("http://127.0.0.1:5000/settings/admin")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print()

# Test PUT settings
print("Testing PUT /settings/admin")
update_data = {
    "profile": {
        "displayName": "John Admin",
        "email": "john@company.com"
    },
    "organisation": {
        "name": "Tech Corp",
        "industry": "technology"
    },
    "ai": {
        "enabled": True,
        "responseTone": "friendly",
        "accuracyThreshold": 90
    },
    "notifications": {
        "email": True,
        "push": False,
        "expenseAlerts": True,
        "weeklyReports": False
    },
    "preferences": {
        "theme": "light"
    }
}

response = requests.put(
    "http://127.0.0.1:5000/settings/admin",
    json=update_data,
    headers={"Content-Type": "application/json"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print()

# Test GET again to verify changes
print("Testing GET /settings/admin after update")
response = requests.get("http://127.0.0.1:5000/settings/admin")
print(f"Status: {response.status_code}")
settings = response.json()["settings"]
print(f"Display Name: {settings['profile']['displayName']}")
print(f"Email: {settings['profile']['email']}")
print(f"Organization: {settings['organisation']['name']}")
print(f"AI Tone: {settings['ai']['responseTone']}")
print(f"Theme: {settings['preferences']['theme']}")