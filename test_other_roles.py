import requests

# Test auditor settings
print("Testing GET /settings/auditor")
response = requests.get("http://127.0.0.1:5000/settings/auditor")
print(f"Status: {response.status_code}")
auditor_settings = response.json()["settings"]
print(f"Auditor Display Name: {auditor_settings['profile']['displayName']}")
print(f"Auditor Organization: {auditor_settings['organisation']}")
print()

# Test employee settings
print("Testing GET /settings/employee")
response = requests.get("http://127.0.0.1:5000/settings/employee")
print(f"Status: {response.status_code}")
employee_settings = response.json()["settings"]
print(f"Employee Display Name: {employee_settings['profile']['displayName']}")
print(f"Employee Organization: {employee_settings['organisation']}")
print()

# Test updating employee settings
print("Testing PUT /settings/employee")
update_data = {
    "profile": {
        "displayName": "Jane Employee",
        "email": "jane@company.com"
    },
    "ai": {
        "enabled": True,
        "responseTone": "casual",
        "accuracyThreshold": 85
    },
    "preferences": {
        "theme": "auto"
    }
}

response = requests.put(
    "http://127.0.0.1:5000/settings/employee",
    json=update_data,
    headers={"Content-Type": "application/json"}
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print("Employee settings updated successfully")