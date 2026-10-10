# Smart Waste Collection and Monitoring System (SWCMS)

> **Software Architecture Academic Project**  
> An enterprise-grade, database-driven smart municipal waste collection and real-time monitoring web application built with **React + Vite**, **Python Flask**, and **MySQL**.

---

## 1. Executive Summary & Modules Implemented

The **SWCMS** platform digitizes municipal waste operations into a unified workflow:
- **Citizen Public Complaint Portal**: Citizens can submit grievances (Overflowing Garbage, Damaged Bin, Bad Odor, Illegal Dumping, Sensor Failure, Others) without logging in, receive an auto-generated unique tracking ID (`CMP-YYYY-XXXX`), and track resolution progress in real time through an interactive milestone timeline.
- **Role-Based Authentication & Authorization**: Secure JWT-based authentication for **Administrator** and **Municipal Authority** roles with cryptographic password hashing (via `Werkzeug/scrypt`), protected backend endpoints, and inactive account validation.
- **Centralized Administrator Operations Center**: Real-time citywide waste conditions, zone density metrics, frequently overflowing bins, asset management (CRUD for garbage bins and fill thresholds), field authority supervision, and audit logging.
- **Authority Operational Command Console**: Prioritized alert dispatch (Critical alarms pinned to top), field collection logging, interactive grievance status management with resolution notes, and unread notification feeds.
- **Decision Support & Prioritization Engine**: Multi-factor decision support scoring based on fill rate, waiting duration, citizen complaint severity, and geographical sector clustering.
- **Transactional Collection Management**: Recording waste collections atomically clears previous fill percentages, updates bin statuses, closes active alerts, and persists permanent collection records.
- **Academic IoT Waste Level Simulator**: Real-time sensor simulation allowing interactive threshold testing (Low, Warning, Critical) and automatic alert generation without requiring physical ESP32 or ultrasonic hardware.
- **Reports, Audits & Analytics**: Real-time response-time analysis (SLA compliance), area fill volume charts, authority performance rankings, and one-click CSV export for collections and complaints.
- **Resilient Dual-Mode Database Layer**: Native support for **MySQL** with parameterized queries and database transactions, backed by an automatic resilient in-memory fallback store to ensure zero-crash reliability during presentations and demonstrations.

---

## 2. Project Architecture & Directory Structure

```
SWCMS/
├── backend/
│   ├── app.py                      # Flask Application entry point & route registration
│   ├── requirements.txt            # Python dependencies
│   ├── config.py                   # Configuration loader
│   ├── extensions.py               # Database and CORS extensions
│   ├── init_db.py                  # Automated MySQL database setup & migration runner
│   ├── create_admin.py             # CLI utility to create/reset administrator accounts
│   ├── .env.example                # Backend environment configuration template
│   ├── .env                        # Local environment variables (git-ignored)
│   ├── database/
│   │   ├── db.py                   # Centralized database manager & resilient fallback store
│   │   └── schema.sql              # Normalized database schema
│   ├── models/                     # Data models (GarbageBin, Alert, Complaint, etc.)
│   ├── routes/
│   │   ├── auth_routes.py          # /api/auth/login, /api/auth/me
│   │   ├── admin_routes.py         # /api/admin/dashboard, /api/admin/authorities, settings
│   │   ├── authority_routes.py     # /api/authority/dashboard
│   │   ├── bin_routes.py           # /api/bins (CRUD & threshold configuration)
│   │   ├── alert_routes.py         # /api/alerts (prioritized listing & resolution)
│   │   ├── complaint_routes.py     # /api/complaints (public submit & track, staff update)
│   │   ├── collection_routes.py    # /api/collections (prioritized queue & completion logs)
│   │   ├── waste_routes.py         # /api/waste/simulate, readings
│   │   ├── notification_routes.py  # /api/notifications
│   │   └── report_routes.py        # /api/reports/summary, /api/reports/export (CSV)
│   ├── services/
│   │   ├── alert_service.py
│   │   ├── collection_service.py   # Transactional collection execution
│   │   ├── complaint_service.py    # Public submissions & tracking codes
│   │   ├── prioritization_service.py # Multi-criteria decision support scoring
│   │   ├── report_service.py       # Metrics aggregation & export logic
│   │   └── waste_monitoring_service.py # Sensor threshold evaluation & alert triggers
│   ├── utils/
│   │   ├── authentication.py       # JWT creation, decoding & role decorators
│   │   └── validators.py          # Input validation helpers
│   └── tests/
│       └── test_swcms.py           # Automated test suite (9 passing tests)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                 # Route management and protected role layouts
│       ├── main.jsx                # React root
│       ├── styles.css              # Custom styling system
│       ├── components/
│       │   ├── Navbar.jsx          # Breadcrumbs, notification bell, user profile & logout
│       │   ├── Sidebar.jsx         # Role-specific navigation sidebar
│       │   ├── DashboardCard.jsx   # KPI metric card
│       │   ├── BinCard.jsx         # Telemetry bin card with progress bar
│       │   ├── AlertCard.jsx       # Priority-badged alert item
│       │   ├── ComplaintCard.jsx   # Grievance summary card
│       │   ├── NotificationPanel.jsx
│       │   ├── StatusBadge.jsx
│       │   └── Loading.jsx
│       ├── context/
│       │   └── AuthContext.jsx     # Live JWT authentication provider
│       ├── pages/
│       │   ├── LandingPage.jsx     # Public landing homepage
│       │   ├── LoginPage.jsx       # Role switcher (Administrator vs Authority)
│       │   ├── citizen/
│       │   │   ├── ComplaintPage.jsx   # Public complaint submission form
│       │   │   └── TrackComplaint.jsx  # Public milestone progress tracker
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx  # System KPIs, fill distribution, zone stats, simulator
│       │   │   ├── ManageBins.jsx      # Asset inventory, add bin modal, status toggle
│       │   │   ├── ManageAuthorities.jsx # Staff accounts, active/inactive toggles
│       │   │   ├── Reports.jsx         # Summary reports & CSV exports
│       │   │   └── Analytics.jsx       # SLA compliance, response time, zone density chart
│       │   └── authority/
│       │       ├── AuthorityDashboard.jsx # Active priority alerts & collection dispatch
│       │       ├── Alerts.jsx          # Prioritized alarms & resolution
│       │       ├── Complaints.jsx      # Citizen complaints & resolution modal
│       │       ├── BinStatus.jsx       # Full telemetry grid with inline sensor simulator
│       │       ├── Collection.jsx      # Decision support prioritized queue
│       │       └── CollectionHistory.jsx # Chronological collection audit trail
│       ├── services/               # Modular API service layer (Axios)
│       └── utils/
│           ├── constants.js
│           └── formatters.js
│
├── Database/
│   ├── schema.sql                  # Normalized MySQL DDL schema
│   └── seed.sql                    # Initial seed data with hashed credentials
│
├── simulator/
│   ├── simulator_config.py         # Interval & threshold configs
│   └── waste_generator.py          # Python daemon transmitting sensor readings to API
│
├── run_backend.bat                 # 1-Click Flask server launcher
├── run_frontend.bat                # 1-Click Vite dev server launcher
├── run_simulator.bat               # 1-Click IoT sensor simulator launcher
├── setup_database.bat              # 1-Click MySQL database initializer
└── README.md
```

---

## 3. Technology Stack

- **Frontend**: React 18, Vite 6, React Router 7, Axios, Lucide React, Modern CSS3
- **Backend**: Python 3.13, Flask 3.1, Flask-Cors, PyJWT, Werkzeug, python-dotenv
- **Database**: MySQL 8.0, `mysql-connector-python`
- **Testing**: pytest

---

## 4. Setup & Execution Instructions

### A. Prerequisites
- **Python 3.10+** (verified on Python 3.13)
- **Node.js 18+ & npm** (Node v20.18.0 configured in `C:\Users\user\AppData\Local\Programs\nodejs`)
- **MySQL Server 8.0** (running locally on port 3306)

---

### B. Installing Dependencies

#### 1. Backend Dependencies
Open a PowerShell terminal in the project directory:
```powershell
pip install -r backend/requirements.txt
```

#### 2. Frontend Dependencies
Open a PowerShell terminal in `frontend/`:
```powershell
cd frontend
npm install
```

---

### C. Configuring MySQL Credentials Safely

The application reads credentials securely from `backend/.env`.
Inspect or create `backend/.env` with your MySQL root password:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_mysql_root_password_here
MYSQL_DATABASE=swcms
SECRET_KEY=swcms-super-secret-jwt-key-for-sha256-production-grade-2026
FLASK_PORT=5000
```

> **Note on Zero-Password/Initial Setup:**  
> If MySQL is running with an empty password, set `MYSQL_PASSWORD=`.  
> If your MySQL root account has a password, enter it in `MYSQL_PASSWORD`.  
> If credentials are not yet entered, SWCMS automatically operates in **Resilient Standalone Mode** with all seed data populated, ensuring zero crashes while you configure your database.

---

### D. Initializing the Database & Schema

You can initialize MySQL using any of the following options:

#### Option 1: 1-Click Batch Script
Double-click [`setup_database.bat`](file:///C:/Users/user/.gemini/antigravity/scratch/SWCMS/setup_database.bat) in the project root. It will prompt for your root password and run the automated initializer.

#### Option 2: Python Migration Script
```powershell
python backend/init_db.py
```

#### Option 3: MySQL Workbench
Open MySQL Workbench, connect to `Local instance MySQL80`, open [`Database/schema.sql`](file:///C:/Users/user/.gemini/antigravity/scratch/SWCMS/Database/schema.sql) and execute it, then open [`Database/seed.sql`](file:///C:/Users/user/.gemini/antigravity/scratch/SWCMS/Database/seed.sql) and execute it.

---

### E. Running the System in Separate VS Code Terminals

#### Terminal 1 — Run Backend (Flask API)
```powershell
cd C:\Users\user\.gemini\antigravity\scratch\SWCMS\backend
python app.py
```
*Backend runs at: **http://localhost:5000***  
*Health Check endpoint: **http://localhost:5000/api/health***

#### Terminal 2 — Run Frontend (React + Vite)
```powershell
cd C:\Users\user\.gemini\antigravity\scratch\SWCMS\frontend
$env:Path = "C:\Users\user\AppData\Local\Programs\nodejs;$env:Path"
npm run dev
```
*Frontend runs at: **http://localhost:5173***

#### Terminal 3 (Optional) — Run IoT Waste Simulator Daemon
```powershell
cd C:\Users\user\.gemini\antigravity\scratch\SWCMS\simulator
python waste_generator.py
```

---

## 5. Seed Credentials & User Access

| Role | Username / Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` / `admin@swcms.com` | `Admin@123` | `http://localhost:5173/login` |
| **Authority 1** | `authority1` / `rahul@swcms.com` | `Authority@123` | `http://localhost:5173/login` |
| **Authority 2** | `authority2` / `arun@swcms.com` | `Authority@123` | `http://localhost:5173/login` |
| **Authority 3** | `authority3` / `vishnu@swcms.com` | `Authority@123` | `http://localhost:5173/login` |
| **Citizen (Public)** | *No login required* | *N/A* | `http://localhost:5173/complaint` |

---

## 6. How to Create or Reset an Administrator Account

Run the secure CLI administrator utility:
```powershell
python backend/create_admin.py <new_username> <new_password>
```
*Example:*
```powershell
python backend/create_admin.py admin Admin@123
```

---

## 7. Verification & Automated Test Results

The backend includes a pytest test suite covering the entire SRS requirements:
```powershell
python -m pytest backend/tests/test_swcms.py -v
```

### Test Suite Execution Output:
```
backend/tests/test_swcms.py::test_health_check PASSED                    [ 11%]
backend/tests/test_swcms.py::test_admin_authentication PASSED            [ 22%]
backend/tests/test_swcms.py::test_authority_authentication PASSED        [ 33%]
backend/tests/test_swcms.py::test_invalid_authentication PASSED          [ 44%]
backend/tests/test_swcms.py::test_public_citizen_complaint_flow PASSED   [ 55%]
backend/tests/test_swcms.py::test_waste_monitoring_threshold_alert PASSED [ 66%]
backend/tests/test_swcms.py::test_prioritized_collection_queue PASSED    [ 77%]
backend/tests/test_swcms.py::test_collection_completion_record PASSED    [ 88%]
backend/tests/test_swcms.py::test_report_summary_and_export PASSED       [100%]

============================== 9 passed in 2.52s ==============================
```

---

## 8. Current Limitations & Future Scope
- **Physical Hardware**: System currently uses software-simulated sensor readings via the REST API and the built-in interactive web UI slider. Hardware integration with ESP32 microcontrollers and HC-SR04 ultrasonic sensors can directly target `POST /api/waste/simulate`.
- **External Notifications**: In-app notifications are fully stored and acknowledged in the database. SMS (Twilio) and Email (SMTP) gateways can be hooked into `notification_service.py` as future enhancements.
