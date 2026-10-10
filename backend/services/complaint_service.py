"""
SWCMS Citizen Complaint Service
Handles public complaint submissions, validation, unique tracking codes,
public status tracking, and authority resolutions.
"""

import datetime
import random
import string
from database.db import get_db_connection, memory_store


VALID_CATEGORIES = [
    "Overflowing Garbage",
    "Damaged Bin",
    "Bad Odor",
    "Illegal Dumping",
    "Sensor Failure",
    "Others"
]


def generate_complaint_code():
    year = datetime.datetime.now().strftime("%Y")
    rand_chars = ''.join(random.choices(string.digits, k=4))
    return f"CMP-{year}-{rand_chars}"


def submit_complaint(citizen_name, category, description, location, citizen_email=None, citizen_phone=None, bin_id=None):
    if not citizen_name or not citizen_name.strip():
        return {"success": False, "error": "Citizen name is required."}
    if not description or not description.strip():
        return {"success": False, "error": "Complaint description is required."}
    if not location or not location.strip():
        return {"success": False, "error": "Location is required."}
    if category not in VALID_CATEGORIES:
        category = "Others"

    complaint_code = generate_complaint_code()

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                INSERT INTO complaints (complaint_code, citizen_name, citizen_email, citizen_phone, category, description, location, bin_id, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'PENDING')
                """,
                (complaint_code, citizen_name.strip(), citizen_email, citizen_phone, category, description.strip(), location.strip(), bin_id)
            )

            # Notification for authorities
            notif_title = "New Citizen Complaint"
            notif_msg = f"Complaint {complaint_code} ({category}) reported at {location}."
            cursor.execute(
                """
                INSERT INTO notifications (title, message, priority, is_read)
                VALUES (%s, %s, 'NORMAL', FALSE)
                """,
                (notif_title, notif_msg)
            )

            conn.commit()
            cursor.close()
            conn.close()

            return {
                "success": True,
                "complaint_code": complaint_code,
                "message": "Complaint submitted successfully."
            }
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return {"success": False, "error": str(e)}

    # Resilient MemoryStore execution
    new_id = len(memory_store.complaints) + 1
    new_record = {
        "complaint_id": new_id,
        "complaint_code": complaint_code,
        "citizen_name": citizen_name.strip(),
        "citizen_email": citizen_email,
        "citizen_phone": citizen_phone,
        "category": category,
        "description": description.strip(),
        "location": location.strip(),
        "bin_id": bin_id,
        "status": "PENDING",
        "resolution_remarks": None,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "resolved_at": None
    }
    memory_store.complaints.append(new_record)

    # Notification
    memory_store.notifications.append({
        "notification_id": len(memory_store.notifications) + 1,
        "authority_id": None,
        "title": "New Citizen Complaint",
        "message": f"Complaint {complaint_code} ({category}) reported at {location}.",
        "priority": "NORMAL",
        "is_read": False,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return {
        "success": True,
        "complaint_code": complaint_code,
        "message": "Complaint submitted successfully."
    }


def track_complaint(complaint_code):
    complaint_code = complaint_code.strip().upper()
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT complaint_id, complaint_code, category, description, location, status, resolution_remarks, created_at, resolved_at
                FROM complaints
                WHERE UPPER(complaint_code) = %s
                """,
                (complaint_code,)
            )
            complaint = cursor.fetchone()
            cursor.close()
            conn.close()
            if complaint:
                return {"success": True, "complaint": complaint}
            return {"success": False, "error": "Complaint ID not found."}
        except Exception as e:
            if conn:
                conn.close()
            return {"success": False, "error": str(e)}

    complaint = next((c for c in memory_store.complaints if c["complaint_code"].upper() == complaint_code), None)
    if complaint:
        # Avoid exposing unnecessary private info to public tracker
        safe_data = {
            "complaint_id": complaint["complaint_id"],
            "complaint_code": complaint["complaint_code"],
            "category": complaint.get("category", "General"),
            "description": complaint["description"],
            "location": complaint["location"],
            "status": complaint["status"],
            "resolution_remarks": complaint.get("resolution_remarks"),
            "created_at": complaint["created_at"],
            "resolved_at": complaint.get("resolved_at")
        }
        return {"success": True, "complaint": safe_data}

    return {"success": False, "error": "Complaint ID not found. Please verify and try again."}


def update_complaint_status(complaint_id, new_status, remarks=None):
    if new_status not in ("PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"):
        return {"success": False, "error": "Invalid complaint status."}

    resolved_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status in ("RESOLVED", "REJECTED") else None

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                UPDATE complaints
                SET status = %s, resolution_remarks = %s, resolved_at = %s
                WHERE complaint_id = %s
                """,
                (new_status, remarks, resolved_at, complaint_id)
            )
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True, "message": f"Complaint status updated to {new_status}."}
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return {"success": False, "error": str(e)}

    complaint = next((c for c in memory_store.complaints if c["complaint_id"] == int(complaint_id)), None)
    if complaint:
        complaint["status"] = new_status
        if remarks:
            complaint["resolution_remarks"] = remarks
        complaint["resolved_at"] = resolved_at
        return {"success": True, "message": f"Complaint status updated to {new_status}."}

    return {"success": False, "error": "Complaint not found."}