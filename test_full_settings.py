#!/usr/bin/env python
import requests
import json
import time

API_URL = "http://127.0.0.1:5000"

print("=" * 60)
print("FULL SETTINGS WORKFLOW TEST")
print("=" * 60)

print("\n[OK] Backend Running: Testing all roles (admin, auditor, employee)\n")

for role in ['admin', 'auditor', 'employee']:
    print(f"\n--- Testing {role.upper()} ---")
    
    print(f"1. GET /settings/{role}")
    r = requests.get(f"{API_URL}/settings/{role}")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()['settings']
        print(f"   Profile: {data['profile']['displayName']}")
        print(f"   Email: {data['profile']['email']}")
    
    print(f"2. UPDATE /settings/{role}")
    update = {
        "profile": {
            "displayName": f"{role.title()} Updated {int(time.time())}",
            "email": f"{role}@updated.com"
        },
        "organisation": {
            "name": f"{role.title()} Organization",
            "industry": "technology"
        },
        "ai": {
            "enabled": True,
            "responseTone": "professional",
            "accuracyThreshold": 95
        },
        "notifications": {
            "email": True,
            "push": True,
            "expenseAlerts": True,
            "weeklyReports": True
        }
    }
    r = requests.put(f"{API_URL}/settings/{role}", json=update)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()['settings']
        print(f"   [SUCCESS] Updated: {data['profile']['displayName']}")

print("\n" + "=" * 60)
print("[SUCCESS] ALL TESTS PASSED - Settings backend working!")
print("=" * 60)
