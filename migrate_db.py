import sqlite3
import os

DB_PATH = "backend/instance/expenses.db"

if os.path.exists(DB_PATH):
    print(f"Found database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(user_settings);")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    print(f"Current columns: {column_names}")
    
    new_columns = {
        'logo_path': 'VARCHAR(255)',
        'contact_info': 'TEXT',
        'help_content': 'TEXT'
    }
    
    for col_name, col_type in new_columns.items():
        if col_name not in column_names:
            print(f"Adding column: {col_name}")
            cursor.execute(f"ALTER TABLE user_settings ADD COLUMN {col_name} {col_type};")
        else:
            print(f"Column {col_name} already exists")
    
    conn.commit()
    conn.close()
    print("Database migration completed!")
else:
    print(f"Database not found at {DB_PATH}")
    print("It will be created when the backend starts")
