# Teacher Teaching Monitoring System 🎓

A comprehensive Flask-based web application for monitoring teacher attendance and performance in schools using face recognition technology, with integrated scheduling, lesson notes management, and administrative analytics.

## 📋 Features

- **👤 Face Recognition Entry**: Teachers mark attendance using facial recognition
- **📅 Timetable Integration**: Automatic punctuality checking against class schedules
- **🔔 Admin Notifications**: Real-time alerts for late arrivals and important events
- **📝 Lesson Notes Management**: Teachers submit and manage daily lesson notes
- **📊 Analytics Dashboard**: Real-time monitoring of attendance, sessions, and performance
- **👨‍🏫 Teacher Management**: Add, edit, and manage teacher profiles with photos
- **📱 Responsive UI**: Mobile-friendly interface for all devices
- **🔐 Role-based Access**: Different views for teachers, admins, and head masters
- **📋 Session Tracking**: Monitor teaching sessions and class attendance
- **🎥 Video Recording**: Record and store teaching sessions
- **📄 Leave Management**: Handle leave requests and approvals

## 🛠️ Technology Stack

- **Backend**: Python Flask 3.1.2
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: SQLite3
- **Computer Vision**: OpenCV, OpenCV-Contrib
- **Authentication**: Flask-Login, Werkzeug
- **Utilities**: NumPy, ReportLab, dnspython
- **Server**: Werkzeug WSGI

## 📦 Requirements

```
Flask==3.1.2
opencv-python
opencv-contrib-python
numpy
Flask-Login
Werkzeug
reportlab
dnspython
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)
- Webcam (for face recognition features)

### Step 1: Clone the Repository
```bash
git clone https://github.com/ArshiyaNasirin/Teacher-Teaching-Monitoring-System.git
cd Teacher-Teaching-Monitoring-System
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
pip install dnspython
```

### Step 3: Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

## 🎯 Usage Guide

### For Teachers:
1. **Register/Login**: Sign up with credentials or login with existing account
2. **Mark Attendance**: Use face recognition to mark attendance
3. **Submit Lesson Notes**: Document daily lesson content and activities
4. **View Schedule**: Check timetable and upcoming classes
5. **Monitor Activity**: View personal attendance and session history

### For Administrators (AHM):
1. **Dashboard**: Monitor all teacher activities in real-time
2. **Manage Teachers**: Add, edit, and remove teacher profiles
3. **Set Timetable**: Configure class schedules and timings
4. **Process Leaves**: Review and approve/reject leave requests
5. **View Analytics**: Access performance reports and analytics
6. **Notifications**: Receive alerts for late arrivals and important events

## 📁 Project Structure

```
Teacher Teaching Monitoring System/
├── app.py                          # Main Flask application
├── requirements.txt                # Project dependencies
├── biometric_model.yml             # Face recognition model
├── school_monitoring.db            # SQLite database
├── README.md                       # Project documentation
├── docs.md                         # Additional documentation
├── static/
│   ├── css/
│   │   └── main.css               # Application styling
│   ├── js/
│   │   ├── core.js                # Core functionality
│   │   ├── biometrics.js          # Face recognition scripts
│   │   ├── analytics.js           # Dashboard analytics
│   │   └── teacher_recording.js   # Session recording
│   └── uploads/
│       ├── dataset/               # Teacher face datasets
│       ├── videos/                # Recorded sessions
│       └── leaves/                # Leave request uploads
└── templates/                      # HTML templates
    ├── base.html                  # Base template
    ├── login.html                 # Login page
    ├── index.html                 # Dashboard home
    ├── teachers.html              # Teacher management
    ├── add_teacher.html           # Add teacher form
    ├── edit_teacher.html          # Edit teacher form
    ├── face_recognition.html      # Face recognition interface
    ├── sessions.html              # Teaching sessions
    ├── start_session.html         # Start new session
    ├── edit_session.html          # Edit session
    ├── timetable.html             # Class timetable
    ├── add_schedule.html          # Add schedule
    ├── edit_schedule.html         # Edit schedule
    ├── lesson_notes.html          # Lesson notes management
    ├── submit_notes.html          # Submit lesson notes
    ├── edit_notes.html            # Edit lesson notes
    ├── ahm_dashboard.html         # Admin dashboard
    ├── admin_leaves.html          # Leave management
    ├── submit_leave.html          # Submit leave request
    ├── school_setup.html          # School configuration
    ├── my_activity.html           # Personal activity log
    ├── register_teacher.html      # Teacher registration
    └── signup.html                # User signup
```

## 🔄 System Workflow

1. **Registration & Authentication**
   - Teachers/Admin register with credentials
   - System validates and stores user data securely

2. **Face Recognition Setup**
   - Upload teacher photos for face dataset
   - System trains recognition model

3. **Daily Operations**
   - Teacher arrives and uses face recognition to mark attendance
   - System checks attendance against timetable
   - Records session start time

4. **Monitoring & Notifications**
   - AHM receives real-time notifications for late arrivals
   - Dashboard displays live attendance status
   - System tracks lesson notes submission

5. **Analytics & Reporting**
   - Generate attendance reports
   - View performance analytics
   - Export data for analysis

## 🔐 Security Features

- Hashed password storage using Werkzeug
- Session-based authentication with Flask-Login
- HTTPONLY and SameSite cookie settings
- Role-based access control
- Secure file upload handling

## 📊 Database Schema

The SQLite database includes tables for:
- Users (teachers, admins, head masters)
- Classes and Schedules
- Attendance Records
- Session Logs
- Lesson Notes
- Leave Requests
- Biometric Data

## 🚧 Configuration

Edit `app.py` to configure:
- Database path: `DB_PATH`
- Secret key: `app.secret_key`
- Session settings
- File upload limits
- Server port

## 🐛 Troubleshooting

**Missing dnspython Module**
```bash
pip install dnspython
```

**Face Recognition Not Working**
- Ensure webcam is connected and accessible
- Check camera permissions
- Verify biometric_model.yml is present

**Database Errors**
- Delete `school_monitoring.db` to reset
- Check database file permissions

## 📝 License

This project is part of school monitoring initiative.

## 👤 Author

**Arshiya Nasirin**

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or report issues.

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the development team.
