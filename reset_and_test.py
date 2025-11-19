import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import app, db, Expense, detect_anomaly
import shutil

with app.app_context():
    print("Resetting database and setting up test data...\n")
    
    db_path = "backend/instance/expenses.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Deleted old database: {db_path}")
    
    db.create_all()
    print("Created fresh database\n")
    
    test_data = [
        {"file": "ubercoffee.jpg", "vendor": "Uber", "category": "Travel", "amount": 32.50},
        {"file": "lunch.jpg", "vendor": "McDonalds", "category": "Food", "amount": 15.75},
        {"file": "office.jpg", "vendor": "Staples", "category": "Office", "amount": 125.00},
        {"file": "bigtravel.jpg", "vendor": "Global Airlines", "category": "Travel", "amount": 6500.00},
        {"file": "newtaxi.jpg", "vendor": "FirstTimeVendor Corp", "category": "Travel", "amount": 2000.00},
    ]
    
    print("Adding test expenses:\n")
    for i, data in enumerate(test_data, 1):
        exp = Expense(
            filename=data["file"],
            category=data["category"],
            vendor=data["vendor"],
            amount=data["amount"],
            text_preview=f"Test {data['vendor']}",
            status="Processed"
        )
        db.session.add(exp)
        db.session.commit()
        
        status, reason = detect_anomaly(exp)
        exp.anomaly_status = status
        exp.anomaly_reason = reason
        db.session.commit()
        
        status_display = "FLAGGED" if status == "flagged" else "NORMAL"
        print(f"{i}. {data['vendor']:30} ${data['amount']:8.2f}  [{status_display}]")
        if reason:
            print(f"   Reason: {reason}")
        print()
    
    print("="*70)
    flagged = Expense.query.filter_by(anomaly_status="flagged").all()
    normal = Expense.query.filter_by(anomaly_status="normal").all()
    
    print(f"Summary:")
    print(f"  Total Expenses: {len(test_data)}")
    print(f"  Flagged: {len(flagged)}")
    print(f"  Normal: {len(normal)}")
    print("="*70)
    
    print("\nChecking API responses...")
    
    with app.test_client() as client:
        print("\n1. GET /anomalies")
        resp = client.get('/anomalies').get_json()
        print(f"   Returns {len(resp.get('anomalies', []))} flagged transactions")
        
        print("\n2. GET /recent-uploads")
        resp = client.get('/recent-uploads').get_json()
        print(f"   Returns {len(resp.get('uploads', []))} recent uploads")
        for upload in resp.get('uploads', []):
            print(f"   - {upload['vendor']:20} anomalyStatus={upload.get('anomalyStatus')}")
