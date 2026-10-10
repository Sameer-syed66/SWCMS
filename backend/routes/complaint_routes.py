from flask import Blueprint, request, jsonify
from services.complaint_service import submit_complaint, track_complaint, update_complaint_status
from database.db import get_db_connection, memory_store

complaint_routes = Blueprint("complaint_routes", __name__)


@complaint_routes.route("/complaints", methods=["POST"])
def create_complaint():
    """PUBLIC: Citizens report issues without logging in."""
    data = request.get_json() or {}
    citizen_name = data.get("citizen_name") or data.get("name")
    citizen_email = data.get("citizen_email") or data.get("email")
    citizen_phone = data.get("citizen_phone") or data.get("phone")
    category = data.get("category", "Overflowing Garbage")
    description = data.get("description")
    location = data.get("location")
    bin_id = data.get("bin_id")

    res = submit_complaint(citizen_name, category, description, location, citizen_email, citizen_phone, bin_id)
    if res.get("success"):
        return jsonify({
            "message": "Complaint submitted successfully",
            "complaint_code": res["complaint_code"]
        }), 201
    else:
        return jsonify({"message": res.get("error", "Failed to submit complaint")}), 400


@complaint_routes.route("/complaints/track/<path:tracking_code>", methods=["GET"])
def track_citizen_complaint(tracking_code):
    """PUBLIC: Citizens track complaint status by Complaint ID."""
    res = track_complaint(tracking_code)
    if res.get("success"):
        return jsonify({"complaint": res["complaint"]}), 200
    return jsonify({"message": res.get("error", "Complaint not found")}), 404


@complaint_routes.route("/complaints", methods=["GET"])
def get_complaints():
    """List complaints with optional filtering by status."""
    status_filter = request.args.get("status")

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = "SELECT * FROM complaints"
            params = []
            if status_filter:
                query += " WHERE status = %s"
                params.append(status_filter)
            query += " ORDER BY created_at DESC"

            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            formatted = []
            for c in rows:
                formatted.append({
                    "id": c["complaint_code"],
                    "complaint_id": c["complaint_id"],
                    "complaint_code": c["complaint_code"],
                    "subject": f"{c.get('category', 'Waste Issue')}: {c['description'][:35]}...",
                    "category": c.get("category", "Overflowing Garbage"),
                    "description": c["description"],
                    "location": c["location"],
                    "citizen": c["citizen_name"],
                    "citizen_email": c.get("citizen_email"),
                    "citizen_phone": c.get("citizen_phone"),
                    "status": c.get("status", "PENDING"),
                    "date": str(c.get("created_at", "Recently")),
                    "resolution_remarks": c.get("resolution_remarks")
                })
            return jsonify({"complaints": formatted}), 200
        except Exception:
            if conn:
                conn.close()

    # MemoryStore
    filtered = memory_store.complaints
    if status_filter:
        filtered = [c for c in filtered if c.get("status") == status_filter]

    formatted = []
    for c in filtered:
        formatted.append({
            "id": c["complaint_code"],
            "complaint_id": c["complaint_id"],
            "complaint_code": c["complaint_code"],
            "subject": f"{c.get('category', 'Waste Issue')}: {c['description'][:35]}...",
            "category": c.get("category", "Overflowing Garbage"),
            "description": c["description"],
            "location": c["location"],
            "citizen": c["citizen_name"],
            "citizen_email": c.get("citizen_email"),
            "citizen_phone": c.get("citizen_phone"),
            "status": c.get("status", "PENDING"),
            "date": c.get("created_at", "Recently"),
            "resolution_remarks": c.get("resolution_remarks")
        })
    return jsonify({"complaints": formatted}), 200


@complaint_routes.route("/complaints/<int:complaint_id>/status", methods=["PUT"])
def update_status(complaint_id):
    """Authority or Admin updates complaint progress or resolves complaint."""
    data = request.get_json() or {}
    new_status = data.get("status")
    remarks = data.get("remarks")

    res = update_complaint_status(complaint_id, new_status, remarks)
    if res.get("success"):
        return jsonify({"message": res["message"]}), 200
    return jsonify({"message": res.get("error", "Update failed")}), 400