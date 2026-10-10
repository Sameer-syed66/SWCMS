import os
import datetime
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error as MySQLError
from werkzeug.security import generate_password_hash, check_password_hash

# Ensure environment variables are loaded
load_dotenv()

# Database config
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "swcms")


def get_db_connection():
    """Attempt to establish a MySQL connection using configured environment credentials."""
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            autocommit=False
        )
        return conn
    except Exception as e:
        return None


def test_db_connection():
    """Test connection without revealing secrets."""
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            connection_timeout=3
        )
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE(), VERSION()")
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        return {
            "connected": True,
            "host": MYSQL_HOST,
            "database": row[0] if row else MYSQL_DATABASE,
            "server_version": row[1] if row else "unknown",
            "mode": "mysql"
        }
    except Exception as e:
        error_msg = str(e)
        return {
            "connected": False,
            "host": MYSQL_HOST,
            "user": MYSQL_USER,
            "database": MYSQL_DATABASE,
            "error": error_msg,
            "hint": "Check MYSQL_PASSWORD in backend/.env or start MySQL service.",
            "mode": "resilient_fallback"
        }


# =========================================================
# RESILIENT FALLBACK DATA STORE
# Mirrors MySQL tables and seed records in memory when
# MySQL connection credentials have not yet been provided.
# =========================================================

class MemoryStore:
    def __init__(self):
        self.reset()

    def reset(self):
        self.administrators = [
            {
                "admin_id": 1,
                "username": "Swcms",
                "password_hash": generate_password_hash("Swcms@123"),
                "full_name": "System Administrator",
                "email": "admin@swcms.com",
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]

        self.authorities = [
            {
                "authority_id": 1,
                "username": "authority1",
                "password_hash": generate_password_hash("Authority@123"),
                "full_name": "Rahul Kumar",
                "email": "rahul@swcms.com",
                "phone": "9876543210",
                "area": "Central Zone",
                "status": "ACTIVE",
                "created_at": "2026-09-01 09:00:00"
            },
            {
                "authority_id": 2,
                "username": "authority2",
                "password_hash": generate_password_hash("Authority@123"),
                "full_name": "Arun Joseph",
                "email": "arun@swcms.com",
                "phone": "9876543211",
                "area": "North Zone",
                "status": "ACTIVE",
                "created_at": "2026-09-05 10:30:00"
            },
            {
                "authority_id": 3,
                "username": "authority3",
                "password_hash": generate_password_hash("Authority@123"),
                "full_name": "Vishnu Raj",
                "email": "vishnu@swcms.com",
                "phone": "9876543212",
                "area": "South Zone",
                "status": "ACTIVE",
                "created_at": "2026-09-10 14:15:00"
            }
        ]

        self.garbage_bins = [
            {"bin_id": 1, "bin_code": "BIN-001", "location": "Main Bus Stand", "area": "Central Zone", "latitude": 9.5380, "longitude": 76.8200, "capacity": 100, "current_level": 25.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "NORMAL", "operational_status": "ACTIVE", "last_updated": "2 min ago"},
            {"bin_id": 2, "bin_code": "BIN-002", "location": "Central Market", "area": "Central Zone", "latitude": 9.5400, "longitude": 76.8220, "capacity": 100, "current_level": 45.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "NORMAL", "operational_status": "ACTIVE", "last_updated": "5 min ago"},
            {"bin_id": 3, "bin_code": "BIN-003", "location": "Municipal Office", "area": "Central Zone", "latitude": 9.5420, "longitude": 76.8240, "capacity": 100, "current_level": 58.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "NORMAL", "operational_status": "ACTIVE", "last_updated": "4 min ago"},
            {"bin_id": 4, "bin_code": "BIN-004", "location": "Railway Station", "area": "North Zone", "latitude": 9.5440, "longitude": 76.8260, "capacity": 100, "current_level": 72.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "WARNING", "operational_status": "ACTIVE", "last_updated": "8 min ago"},
            {"bin_id": 5, "bin_code": "BIN-005", "location": "Government Hospital", "area": "North Zone", "latitude": 9.5460, "longitude": 76.8280, "capacity": 100, "current_level": 81.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "WARNING", "operational_status": "ACTIVE", "last_updated": "3 min ago"},
            {"bin_id": 6, "bin_code": "BIN-006", "location": "College Junction", "area": "North Zone", "latitude": 9.5480, "longitude": 76.8300, "capacity": 100, "current_level": 88.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "FULL", "operational_status": "ACTIVE", "last_updated": "1 min ago"},
            {"bin_id": 7, "bin_code": "BIN-007", "location": "Shopping Complex", "area": "South Zone", "latitude": 9.5500, "longitude": 76.8320, "capacity": 100, "current_level": 93.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "FULL", "operational_status": "ACTIVE", "last_updated": "Just now"},
            {"bin_id": 8, "bin_code": "BIN-008", "location": "Residential Area A", "area": "South Zone", "latitude": 9.5520, "longitude": 76.8340, "capacity": 100, "current_level": 96.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "FULL", "operational_status": "ACTIVE", "last_updated": "Just now"},
            {"bin_id": 9, "bin_code": "BIN-009", "location": "Residential Area B", "area": "South Zone", "latitude": 9.5540, "longitude": 76.8360, "capacity": 100, "current_level": 67.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "NORMAL", "operational_status": "ACTIVE", "last_updated": "7 min ago"},
            {"bin_id": 10, "bin_code": "BIN-010", "location": "Town Park", "area": "Central Zone", "latitude": 9.5560, "longitude": 76.8380, "capacity": 100, "current_level": 35.0, "warning_threshold": 70.0, "critical_threshold": 85.0, "status": "NORMAL", "operational_status": "ACTIVE", "last_updated": "12 min ago"}
        ]

        self.waste_level_records = [
            {"record_id": 1, "bin_id": 1, "waste_level": 25.0, "recorded_at": "2026-10-10 08:00:00"},
            {"record_id": 2, "bin_id": 2, "waste_level": 45.0, "recorded_at": "2026-10-10 08:30:00"},
            {"record_id": 3, "bin_id": 3, "waste_level": 58.0, "recorded_at": "2026-10-10 09:00:00"},
            {"record_id": 4, "bin_id": 4, "waste_level": 72.0, "recorded_at": "2026-10-10 09:30:00"},
            {"record_id": 5, "bin_id": 5, "waste_level": 81.0, "recorded_at": "2026-10-10 10:00:00"},
            {"record_id": 6, "bin_id": 6, "waste_level": 88.0, "recorded_at": "2026-10-10 10:30:00"},
            {"record_id": 7, "bin_id": 7, "waste_level": 93.0, "recorded_at": "2026-10-10 11:00:00"},
            {"record_id": 8, "bin_id": 8, "waste_level": 96.0, "recorded_at": "2026-10-10 11:30:00"},
            {"record_id": 9, "bin_id": 9, "waste_level": 67.0, "recorded_at": "2026-10-10 12:00:00"},
            {"record_id": 10, "bin_id": 10, "waste_level": 35.0, "recorded_at": "2026-10-10 12:30:00"}
        ]

        self.alerts = [
            {
                "alert_id": 1,
                "bin_id": 8,
                "bin_code": "BIN-008",
                "location": "Residential Area A",
                "alert_type": "FULL_BIN",
                "message": "Bin BIN-008 reached 96% capacity and requires immediate collection.",
                "waste_level": 96.0,
                "priority": "CRITICAL",
                "status": "PENDING",
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "alert_id": 2,
                "bin_id": 7,
                "bin_code": "BIN-007",
                "location": "Shopping Complex",
                "alert_type": "FULL_BIN",
                "message": "Bin BIN-007 reached 93% capacity and requires urgent collection.",
                "waste_level": 93.0,
                "priority": "CRITICAL",
                "status": "PENDING",
                "created_at": (datetime.datetime.now() - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "alert_id": 3,
                "bin_id": 6,
                "bin_code": "BIN-006",
                "location": "College Junction",
                "alert_type": "HIGH_WASTE_LEVEL",
                "message": "Bin BIN-006 reached 88% capacity and crossed threshold.",
                "waste_level": 88.0,
                "priority": "HIGH",
                "status": "PENDING",
                "created_at": (datetime.datetime.now() - datetime.timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S")
            }
        ]

        self.complaints = [
            {
                "complaint_id": 1,
                "complaint_code": "CMP-2026-001",
                "citizen_name": "Akhil Menon",
                "citizen_email": "akhil@example.com",
                "citizen_phone": "9876500001",
                "category": "Overflowing Garbage",
                "description": "Garbage has not been collected for two days and is overflowing on the pavement.",
                "location": "Central Market",
                "bin_id": 2,
                "status": "PENDING",
                "resolution_remarks": None,
                "created_at": (datetime.datetime.now() - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
                "resolved_at": None
            },
            {
                "complaint_id": 2,
                "complaint_code": "CMP-2026-002",
                "citizen_name": "Anjali Nair",
                "citizen_email": "anjali@example.com",
                "citizen_phone": "9876500002",
                "category": "Bad Odor",
                "description": "Severe foul odor originating from uncleaned waste bins near residential gate.",
                "location": "Residential Area B",
                "bin_id": 9,
                "status": "IN_PROGRESS",
                "resolution_remarks": None,
                "created_at": (datetime.datetime.now() - datetime.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
                "resolved_at": None
            },
            {
                "complaint_id": 3,
                "complaint_code": "CMP-2026-003",
                "citizen_name": "Rahul Das",
                "citizen_email": "rahul@example.com",
                "citizen_phone": "9876500003",
                "category": "Damaged Bin",
                "description": "Bin lid is completely broken and waste is spilling out into the bus stop area.",
                "location": "Main Bus Stand",
                "bin_id": 1,
                "status": "RESOLVED",
                "resolution_remarks": "Bin repaired and waste cleared by maintenance crew.",
                "created_at": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
                "resolved_at": (datetime.datetime.now() - datetime.timedelta(hours=18)).strftime("%Y-%m-%d %H:%M:%S")
            }
        ]

        self.collection_history = [
            {
                "collection_id": 1,
                "bin_id": 1,
                "bin_code": "BIN-001",
                "location": "Main Bus Stand",
                "authority_id": 1,
                "authority_name": "Rahul Kumar",
                "collected_level": 92.0,
                "collected_at": (datetime.datetime.now() - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"),
                "remarks": "Morning routine collection completed successfully.",
                "related_alert_id": None
            },
            {
                "collection_id": 2,
                "bin_id": 2,
                "bin_code": "BIN-002",
                "location": "Central Market",
                "authority_id": 1,
                "authority_name": "Rahul Kumar",
                "collected_level": 95.0,
                "collected_at": (datetime.datetime.now() - datetime.timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
                "remarks": "Commercial area bin emptied and disinfected.",
                "related_alert_id": None
            },
            {
                "collection_id": 3,
                "bin_id": 3,
                "bin_code": "BIN-003",
                "location": "Municipal Office",
                "authority_id": 2,
                "authority_name": "Arun Joseph",
                "collected_level": 87.0,
                "collected_at": (datetime.datetime.now() - datetime.timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
                "remarks": "Municipal office bin cleared before afternoon peak.",
                "related_alert_id": None
            }
        ]

        self.notifications = [
            {
                "notification_id": 1,
                "authority_id": None,
                "title": "Critical Waste Alert",
                "message": "Bin BIN-008 reached 96% capacity in South Zone.",
                "priority": "HIGH",
                "is_read": False,
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "notification_id": 2,
                "authority_id": None,
                "title": "Critical Waste Alert",
                "message": "Bin BIN-007 reached 93% capacity in South Zone.",
                "priority": "HIGH",
                "is_read": False,
                "created_at": (datetime.datetime.now() - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "notification_id": 3,
                "authority_id": None,
                "title": "New Citizen Complaint",
                "message": "New complaint CMP-2026-001 submitted for Central Market.",
                "priority": "NORMAL",
                "is_read": False,
                "created_at": (datetime.datetime.now() - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
            }
        ]

        self.system_settings = {
            "default_warning_threshold": "70",
            "default_critical_threshold": "85",
            "response_sla_hours": "24"
        }


# Singleton memory store
memory_store = MemoryStore()
