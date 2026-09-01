import sqlite3, base64, cv2, numpy as np

DB = 'Teacher Teaching Monitoring System - Copy/school_monitoring.db'
FACE_SIZE = (200, 200)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
recognizer   = cv2.face.LBPHFaceRecognizer_create(radius=2, neighbors=16, grid_x=8, grid_y=8)

conn = sqlite3.connect(DB)
c = conn.cursor()
c.execute("SELECT id, face_hash FROM teachers WHERE face_hash != 'MANUAL_ENTRY' AND face_hash IS NOT NULL")
teachers = c.fetchall()
c.execute("SELECT teacher_id, face_image FROM teacher_faces WHERE face_image IS NOT NULL")
pose_rows = c.fetchall()
conn.close()

faces, labels = [], []

def add_face(teacher_id, b64_data, tag):
    try:
        img_bytes = base64.b64decode(b64_data)
        arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            print(f'  [SKIP] Could not decode {tag}')
            return
        detected = face_cascade.detectMultiScale(img, 1.3, 5)
        if len(detected) > 0:
            detected = sorted(detected, key=lambda f: f[2]*f[3], reverse=True)
            fx, fy, fw, fh = detected[0]
            face = img[fy:fy+fh, fx:fx+fw]
            print(f'  [FACE FOUND] {tag} — {fw}x{fh}px')
        else:
            face = img
            print(f'  [FALLBACK]   {tag} — no face, using full frame')
        face = cv2.resize(face, FACE_SIZE)
        faces.append(face)
        labels.append(teacher_id)
    except Exception as e:
        print(f'  [ERROR] Failed to process {tag}: {e}')


print('=== Primary photos ===')
for tid, fhash in teachers:
    add_face(tid, fhash, f'teacher_id={tid} primary')

print(f'\n=== Pose photos ({len(pose_rows)} images) ===')
for idx, (tid, fimg) in enumerate(pose_rows):
    add_face(tid, fimg, f'teacher_id={tid} pose_{idx+1}')

print(f'\nTotal training samples: {len(faces)}')

if len(faces) == 0:
    print('ERROR: No training data. Re-register the teacher.')
    exit(1)

recognizer.train(faces, np.array(labels))
print('Model trained successfully!\n')

print('=== Self-test on training images ===')
correct = 0
for i, (face, lbl) in enumerate(zip(faces, labels)):
    pred_lbl, conf = recognizer.predict(face)
    acc = max(0.0, min(100.0, 100.0 - conf))
    status = 'PASS' if pred_lbl == lbl else 'FAIL'
    marker = 'PASS' if pred_lbl == lbl else 'FAIL'
    print(f'  [{marker}] Sample {i+1:02d}: predicted={pred_lbl} expected={lbl}  conf={conf:.1f}  accuracy={acc:.1f}%')
    if pred_lbl == lbl:
        correct += 1

print(f'\nSelf-test result: {correct}/{len(faces)} correct = {100*correct/len(faces):.1f}%')
if correct == len(faces):
    print('All training images recognized correctly. Model is ready!')
else:
    print('WARNING: Some training images not recognized. Consider re-capturing poses.')
