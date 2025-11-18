import sqlite3
import os

# Connect to the database
db_path = os.path.join('backend', 'instance', 'expenses.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables:", tables)

# Check if user_settings table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'")
user_settings_table = cursor.fetchone()
if user_settings_table:
    print("user_settings table exists!")

    # Get table schema
    cursor.execute("PRAGMA table_info(user_settings)")
    columns = cursor.fetchall()
    print("user_settings columns:")
    for col in columns:
        print(f"  {col}")
else:
    print("user_settings table does not exist yet")

conn.close()