import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import app, db, Expense, detect_anomaly

with app.app_context():
    print("Fixing anomaly status for all existing expenses...\n")
    
    expenses = Expense.query.all()
    print(f"Found {len(expenses)} expenses\n")
    
    if len(expenses) == 0:
        print("No expenses in database. They will get flagged/normal status when uploaded.")
    else:
        print("Processing each expense...")
        for i, expense in enumerate(expenses, 1):
            if not expense.anomaly_status or expense.anomaly_status == "":
                status, reason = detect_anomaly(expense)
                expense.anomaly_status = status
                expense.anomaly_reason = reason
                db.session.commit()
                print(f"{i}. {expense.vendor} (${expense.amount})")
                print(f"   Status: {status}")
                if reason:
                    print(f"   Reason: {reason}")
                print()
        
        print("="*60)
        flagged = Expense.query.filter_by(anomaly_status="flagged").all()
        normal = Expense.query.filter_by(anomaly_status="normal").all()
        
        print(f"Summary:")
        print(f"  Total: {len(expenses)}")
        print(f"  Flagged: {len(flagged)}")
        print(f"  Normal: {len(normal)}")
        print("="*60)
