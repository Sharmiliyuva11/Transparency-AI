import os

db_file = r"C:\Users\bhara\OneDrive\Desktop\Transparency-AI\backend\instance\expenses.db"

if os.path.exists(db_file):
    try:
        os.remove(db_file)
        print(f"SUCCESS: Deleted old database")
        print(f"Path: {db_file}")
        print("\nRestart the backend to create a new database with the correct schema")
    except Exception as e:
        print(f"ERROR: Could not delete database: {e}")
else:
    print(f"Database not found at: {db_file}")
    print("It will be created when you start the backend")
