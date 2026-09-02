import sqlite3
import os

DB_PATH = 'Teacher Teaching Monitoring System - Copy/school_monitoring.db'

print(f"Connecting to database: {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Check tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print("Tables in database:", tables)

# Inspect teachers
c.execute("SELECT id, name, subject, face_hash IS NOT NULL FROM teachers")
teachers = c.fetchall()
print("\nTeachers Table:")
for t in teachers:
    print(t)

# Inspect teacher faces count per teacher
try:
    c.execute("SELECT teacher_id, COUNT(*) FROM teacher_faces GROUP BY teacher_id")
    faces_count = c.fetchall()
    print("\nTeacher Faces count per teacher:")
    for fc in faces_count:
        print(fc)
except Exception as e:
    print("\nCould not read teacher_faces table:", e)

conn.close()
