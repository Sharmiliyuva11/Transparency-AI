import requests
import json
from pathlib import Path
import tempfile
from PIL import Image
import io

BASE_URL = 'http://127.0.0.1:5000'
ROLE = 'admin'

print("Testing Logo Upload, Contact, and Help Functionality\n")
print("=" * 60)

try:
    print("\n1. Creating a test image for logo upload...")
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    print("\n2. Testing Logo Upload...")
    files = {'file': ('test_logo.png', img_bytes, 'image/png')}
    response = requests.post(f'{BASE_URL}/settings/{ROLE}/upload-logo', files=files)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        logo_path = result.get('logoPath', '')
        print(f"Logo uploaded successfully to: {logo_path}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    print("\n3. Testing Contact Information Update...")
    contact_data = {
        "contact": {
            "info": "Support Email: support@company.com\nPhone: +1-234-567-8900\nAddress: 123 Main St, City, State 12345"
        }
    }
    response = requests.put(
        f'{BASE_URL}/settings/{ROLE}',
        json=contact_data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Contact Info: {result['settings']['contact']['info']}")
    print("Contact information saved successfully!")
    
    print("\n4. Testing Help Documentation Update...")
    help_data = {
        "help": {
            "content": """## FAQ

### How to use the dashboard?
1. Log in with your credentials
2. Navigate using the sidebar menu
3. View reports and analytics

### How to upload expenses?
1. Click the 'New Expense' button
2. Upload receipt image
3. Review AI analysis
4. Submit for approval

### Contact Support
For assistance, email support@company.com"""
        }
    }
    response = requests.put(
        f'{BASE_URL}/settings/{ROLE}',
        json=help_data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Help Content (first 100 chars): {result['settings']['help']['content'][:100]}...")
    print("Help documentation saved successfully!")
    
    print("\n5. Retrieving all settings to verify...")
    response = requests.get(f'{BASE_URL}/settings/{ROLE}')
    print(f"Status: {response.status_code}")
    result = response.json()
    settings = result['settings']
    
    print(f"\nLoaded Settings:")
    print(f"  Logo Path: {settings['organisation'].get('logoPath', 'Not set')}")
    print(f"  Contact Info: {settings['contact'].get('info', 'Not set')[:50]}...")
    print(f"  Help Content: {settings['help'].get('content', 'Not set')[:50]}...")
    
    print("\n" + "=" * 60)
    print("All tests completed successfully!")
    print("=" * 60)
    
except Exception as e:
    print(f"\nError: {str(e)}")
    print(f"Make sure the backend is running at {BASE_URL}")
