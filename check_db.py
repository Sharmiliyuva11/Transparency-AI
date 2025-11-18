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

# Get expense data
cursor.execute("SELECT * FROM expense LIMIT 10")
expenses = cursor.fetchall()
print("Sample expenses:")
for expense in expenses:
    print(expense)

# Get stats
cursor.execute("SELECT COUNT(*) FROM expense")
count = cursor.fetchone()[0]
print(f"Total expenses: {count}")

conn.close()