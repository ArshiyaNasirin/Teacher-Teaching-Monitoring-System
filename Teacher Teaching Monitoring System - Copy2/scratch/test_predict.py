import sqlite3
import base64
import cv2
import numpy as np
import os

DB_PATH = 'Teacher Teaching Monitoring System - Copy/school_monitoring.db'
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute('SELECT id, face_hash FROM teachers WHERE face_hash IS NOT NULL')
teachers = c.fetchall()

c.execute('SELECT teacher_id, face_image FROM teacher_faces WHERE face_image IS NOT NULL')
extra_faces = c.fetchall()

conn.close()

print(f"Loaded {len(teachers)} teachers and {len(extra_faces)} extra pose images.")

faces = []
labels = []

# Process primary
for teacher_id, face_base64 in teachers:
    try:
        image_bytes = base64.b64decode(face_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            faces.append(img)
            labels.append(teacher_id)
    except Exception as e:
        print("Error reading primary face:", e)

# Process poses
for teacher_id, face_base64 in extra_faces:
    try:
        image_bytes = base64.b64decode(face_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            faces.append(img)
            labels.append(teacher_id)
    except Exception as e:
        print("Error reading pose face:", e)

print(f"Total training samples: {len(faces)}")
print("Labels array:", labels)

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.train(faces, np.array(labels))

print("\n--- Testing predictions on training dataset ---")
for idx, (face, expected_label) in enumerate(zip(faces, labels)):
    label, confidence = recognizer.predict(face)
    print(f"Sample {idx+1}: Expected Label={expected_label}, Predicted Label={label}, Confidence={confidence:.2f}")
