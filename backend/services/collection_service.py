"""
SWCMS Collection Service
Handles transactional collection completions, bin level resets,
alert resolutions, and collection history recording.
"""

import datetime
from database.db import get_db_connection, memory_store


def record_bin_collection(bin_id, authority_id=None, remarks="Bin emptied successfully.", authority_name="Authority"):
    """
    Execute collection workflow:
    - Capture previous waste level
    - Reset bin waste level to 0% and status to NORMAL/COLLECTED
    - Resolve any active alerts for this bin
    - Record entry into collection_history
    """
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)

            # 1. Fetch current bin info
            cursor.execute("SELECT * FROM garbage_bins WHERE bin_id = %s", (bin_id,))
            bin_data = cursor.fetchone()
            if not bin_data:
                cursor.close()
                conn.close()
                return {"success": False, "error": f"Bin ID {bin_id} not found."}

            collected_level = float(bin_data.get("current_level") or 0.0)

            # 2. Check and resolve active alert
            cursor.execute(
                """
                SELECT alert_id FROM alerts
                WHERE bin_id = %s AND status IN ('PENDING', 'ASSIGNED')
                ORDER BY created_at DESC LIMIT 1
                """,
                (bin_id,)
            )
            active_alert = cursor.fetchone()
            related_alert_id = active_alert["alert_id"] if active_alert else None

            if related_alert_id:
                cursor.execute(
                    """
                    UPDATE alerts
                    SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP
                    WHERE alert_id = %s
                    """,
                    (related_alert_id,)
                )

            # 3. Reset bin level
            cursor.execute(
                """
                UPDATE garbage_bins
                SET current_level = 0.0, status = 'NORMAL', last_updated = CURRENT_TIMESTAMP
                WHERE bin_id = %s
                """,
                (bin_id,)
            )

            # 4. Insert into collection_history
            cursor.execute(
                """
                INSERT INTO collection_history (bin_id, authority_id, collected_level, remarks, related_alert_id)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (bin_id, authority_id, collected_level, remarks, related_alert_id)
            )

            conn.commit()
            cursor.close()
            conn.close()

            return {
                "success": True,
                "bin_id": bin_id,
                "bin_code": bin_data["bin_code"],
                "collected_level": collected_level,
                "status": "NORMAL",
                "alert_resolved": bool(related_alert_id),
                "message": f"Bin {bin_data['bin_code']} collection recorded successfully."
            }

        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return {"success": False, "error": str(e)}

    # Resilient MemoryStore execution
    target_bin = next((b for b in memory_store.garbage_bins if b["bin_id"] == int(bin_id)), None)
    if not target_bin:
        return {"success": False, "error": f"Bin ID {bin_id} not found."}

    collected_level = float(target_bin.get("current_level") or 0.0)
    target_bin["current_level"] = 0.0
    target_bin["status"] = "NORMAL"
    target_bin["last_updated"] = "Just now"

    # Resolve active alert
    related_alert_id = None
    for a in memory_store.alerts:
        if a["bin_id"] == int(bin_id) and a["status"] in ("PENDING", "ASSIGNED"):
            a["status"] = "RESOLVED"
            a["resolved_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            related_alert_id = a["alert_id"]
            break

    # Add collection record
    new_cid = len(memory_store.collection_history) + 1
    memory_store.collection_history.append({
        "collection_id": new_cid,
        "bin_id": int(bin_id),
        "bin_code": target_bin["bin_code"],
        "location": target_bin["location"],
        "authority_id": authority_id or 1,
        "authority_name": authority_name or "Assigned Authority",
        "collected_level": collected_level,
        "collected_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "remarks": remarks,
        "related_alert_id": related_alert_id
    })

    return {
        "success": True,
        "bin_id": int(bin_id),
        "bin_code": target_bin["bin_code"],
        "collected_level": collected_level,
        "status": "NORMAL",
        "alert_resolved": bool(related_alert_id),
        "message": f"Bin {target_bin['bin_code']} collection recorded successfully."
    }