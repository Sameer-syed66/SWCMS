from flask import Blueprint, jsonify
from database.db import get_db_connection, memory_store
from services.prioritization_service import prioritize_collection_queue

authority_routes = Blueprint("authority_routes", __name__)


@authority_routes.route("/authority/dashboard", methods=["GET"])
def authority_dashboard():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)

            # 1. Active alerts ordered by priority
            cursor.execute("""
                SELECT a.*, b.bin_code, b.location, b.area
                FROM alerts a
                JOIN garbage_bins b ON a.bin_id = b.bin_id
                WHERE a.status IN ('PENDING', 'ASSIGNED')
                ORDER BY 
                    CASE a.priority
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        ELSE 4
                    END ASC,
                    a.created_at DESC
                LIMIT 10
            """)
            alerts = cursor.fetchall()

            # 2. Prioritized bins needing collection
            cursor.execute("SELECT * FROM garbage_bins WHERE operational_status = 'ACTIVE' ORDER BY current_level DESC LIMIT 6")
            bins = cursor.fetchall()

            # 3. Pending complaints
            cursor.execute("SELECT COUNT(*) AS pending_complaints FROM complaints WHERE status IN ('PENDING', 'IN_PROGRESS')")
            pending_complaints = cursor.fetchone()["pending_complaints"]

            # 4. Completed collections today
            cursor.execute("SELECT COUNT(*) AS collections_today FROM collection_history WHERE DATE(collected_at) = CURDATE()")
            collections_today = cursor.fetchone()["collections_today"]

            # 5. Recent notifications
            cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5")
            notifications = cursor.fetchall()

            cursor.close()
            conn.close()

            # Format alerts for frontend
            formatted_alerts = []
            for a in alerts:
                formatted_alerts.append({
                    "id": a["alert_id"],
                    "bin": a["bin_code"],
                    "bin_id": a["bin_id"],
                    "title": a["message"],
                    "location": a["location"],
                    "level": float(a.get("waste_level") or 0),
                    "severity": a.get("priority", "MEDIUM").capitalize(),
                    "priority": a.get("priority", "MEDIUM"),
                    "status": a.get("status", "PENDING"),
                    "time": str(a.get("created_at", "Recently"))
                })

            formatted_bins = []
            for b in bins:
                formatted_bins.append({
                    "id": b["bin_code"],
                    "bin_id": b["bin_id"],
                    "location": b["location"],
                    "level": float(b.get("current_level") or 0),
                    "status": b.get("status", "NORMAL"),
                    "lastUpdated": str(b.get("last_updated", "Recently"))
                })

            return jsonify({
                "alerts": formatted_alerts,
                "bins": formatted_bins,
                "pending_complaints": pending_complaints,
                "collections_today": collections_today,
                "notifications": notifications
            }), 200

        except Exception:
            if conn:
                conn.close()

    # MemoryStore
    active_alerts = [a for a in memory_store.alerts if a["status"] in ("PENDING", "ASSIGNED")]
    priority_map = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
    active_alerts.sort(key=lambda x: priority_map.get(x.get("priority", "MEDIUM"), 4))

    formatted_alerts = []
    for a in active_alerts[:10]:
        formatted_alerts.append({
            "id": a["alert_id"],
            "bin": a.get("bin_code", f"BIN-{a['bin_id']:03d}"),
            "bin_id": a["bin_id"],
            "title": a["message"],
            "location": a.get("location", "Main Road"),
            "level": float(a.get("waste_level") or 0),
            "severity": a.get("priority", "MEDIUM").capitalize(),
            "priority": a.get("priority", "MEDIUM"),
            "status": a.get("status", "PENDING"),
            "time": a.get("created_at", "Recently")
        })

    sorted_bins = sorted(memory_store.garbage_bins, key=lambda b: float(b.get("current_level", 0)), reverse=True)[:6]
    formatted_bins = []
    for b in sorted_bins:
        formatted_bins.append({
            "id": b["bin_code"],
            "bin_id": b["bin_id"],
            "location": b["location"],
            "level": float(b.get("current_level") or 0),
            "status": b.get("status", "NORMAL"),
            "lastUpdated": b.get("last_updated", "Recently")
        })

    return jsonify({
        "alerts": formatted_alerts,
        "bins": formatted_bins,
        "pending_complaints": sum(1 for c in memory_store.complaints if c["status"] in ("PENDING", "IN_PROGRESS")),
        "collections_today": len(memory_store.collection_history),
        "notifications": memory_store.notifications[:5]
    }), 200