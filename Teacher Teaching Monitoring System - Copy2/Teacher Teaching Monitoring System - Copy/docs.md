# Technical Stack Documentation

This document provides a detailed breakdown of the programming languages and technologies used in the **Teacher Face Recognition Monitoring System**.

---

## 1. Frontend (Client-Side)
The frontend is the visual and interactive part of the application that runs in the user's browser.

### Technologies Used:
*   **HTML5**: Provides the structural foundation of the web pages (forms, video containers, dashboards).
*   **CSS3 (Modern UI)**: Used for styling, including premium features like **Glassmorphism**, **Flexbox**, and **Grid** layouts for a futuristic aesthetic.
*   **JavaScript (Vanilla)**: Handles the logic for the **Camera Stream**, image capture, and asynchronous communication (AJAX) with the server.

### Why these choices?
*   **Performance**: Vanilla JavaScript is used instead of heavy frameworks (like React or Angular) to ensure zero latency when accessing the camera hardware and processing live video frames.
*   **Simplicity**: Direct DOM manipulation allows for a more lightweight and faster user experience.

---

## 2. Backend (Server-Side)
The backend manages the database, authenticates users, and runs the complex face recognition logic.

### Technologies Used:
*   **Python**: The primary programming language for server-side logic.
*   **Flask**: A lightweight WSGI web application framework.
*   **OpenCV & LBPH**: Computer vision libraries used for detecting and recognizing faces.

### Why these choices?
*   **AI Dominance**: Python is the global standard for Artificial Intelligence and Computer Vision. Its libraries (OpenCV, NumPy) are far more mature and efficient for face recognition than those in PHP or Node.js.
*   **Flexibility**: Flask is a "micro-framework," meaning it is lightweight and allows us to build exactly what we need without unnecessary overhead.

---

## 3. Database Management
The database stores all persistent information.

### Technology Used:
*   **SQLite3**: A relational database management system contained in a single file.

### Why this choice?
*   **Portability**: Since it is file-based, the entire system can be moved or backed up easily without configuring a separate database server (like MySQL or PostgreSQL).
*   **Efficiency**: It is perfectly suited for school-level deployments where the number of records is manageable and speed is a priority.

---

## 4. Comparison Summary

| Component | Our Stack | Alternatives (Comparison) | Why we are better for this task? |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vanilla JS** | React, Vue, Angular | Faster hardware (camera) access with less overhead. |
| **Backend** | **Python (Flask)** | PHP, Node.js, Java | Superior AI/OpenCV support for biometric data. |
| **Database** | **SQLite** | MySQL, MongoDB | No server configuration needed; highly portable. |

---

## 5. Security & Identity Management
*   **Password Security**: The system uses `PBKDF2` hashing via the **Werkzeug** library to ensure user passwords are never stored in plain text.
*   **Identity Verification**: The backend performs a match check between the scanned image and the selected Teacher ID to ensure data integrity.
