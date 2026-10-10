from flask import Blueprint, request, jsonify
from database.db import get_db_connection, memory_store

alert_routes = Blueprint("alert_routes", __name__)


@alert_routes.route("/alerts", methods=["GET"])
def get_alerts():
    status_filter = request.args.get("status")

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = """
                SELECT a.*, b.bin_code, b.location, b.area
                FROM alerts a
                JOIN garbage_bins b ON a.bin_id = b.bin_id
            """
            params = []
            if status_filter:
                query += " WHERE a.status = %s"
                params.append(status_filter)

            query += """
                ORDER BY 
                    CASE a.priority
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        ELSE 4
                    END ASC,
                    a.created_at DESC
            """
            cursor.execute(query, tuple(params))
            alerts = cursor.fetchall()
            cursor.close()
            conn.close()

            formatted = []
            for a in alerts:
                formatted.append({
                    "id": a["alert_id"],
                    "alert_id": a["alert_id"],
                    "bin": a["bin_code"],
                    "bin_id": a["bin_id"],
                    "title": a["message"],
                    "message": a["message"],
                    "location": a["location"],
                    "area": a.get("area"),
                    "level": float(a.get("waste_level") or 0),
                    "severity": a.get("priority", "MEDIUM").capitalize(),
                    "priority": a.get("priority", "MEDIUM"),
                    "status": a.get("status", "PENDING"),
                    "time": str(a.get("created_at", "Recently"))
                })
            return jsonify({"alerts": formatted}), 200
        except Exception:
            if conn:
                conn.close()

    # MemoryStore
    filtered = memory_store.alerts
    if status_filter:
        filtered = [a for a in filtered if a["status"] == status_filter]

    priority_map = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
    sorted_alerts = sorted(filtered, key=lambda x: (priority_map.get(x.get("priority", "MEDIUM"), 4), x.get("created_at", "")), reverse=False)

    formatted = []
    for a in sorted_alerts:
        formatted.append({
            "id": a["alert_id"],
            "alert_id": a["alert_id"],
            "bin": a.get("bin_code", f"BIN-{a['bin_id']:03d}"),
            "bin_id": a["bin_id"],
            "title": a["message"],
            "message": a["message"],
            "location": a.get("location", "Location"),
            "level": float(a.get("waste_level") or 0),
            "severity": a.get("priority", "MEDIUM").capitalize(),
            "priority": a.get("priority", "MEDIUM"),
            "status": a.get("status", "PENDING"),
            "time": a.get("created_at", "Recently")
        })
    return jsonify({"alerts": formatted}), 200


@alert_routes.route("/alerts/<int:alert_id>/resolve", methods=["PUT"])
def resolve_alert(alert_id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "UPDATE alerts SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP WHERE alert_id = %s",
                (alert_id,)
            )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Alert resolved successfully"}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    target = next((a for a in memory_store.alerts if a["alert_id"] == alert_id), None)
    if target:
        target["status"] = "RESOLVED"
        return jsonify({"message": "Alert resolved successfully"}), 200

    return jsonify({"message": "Alert not found"}), 404