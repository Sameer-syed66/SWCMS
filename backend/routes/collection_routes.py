from flask import Blueprint, request, jsonify
from database.db import get_db_connection, memory_store
from services.collection_service import record_bin_collection
from services.prioritization_service import prioritize_collection_queue

collection_routes = Blueprint("collection_routes", __name__)


@collection_routes.route("/collections/queue", methods=["GET"])
def get_prioritized_queue():
    """Returns bins ranked by decision support priority score for collection teams."""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM garbage_bins WHERE operational_status = 'ACTIVE' ORDER BY bin_id ASC")
            bins = cursor.fetchall()
            cursor.execute("SELECT * FROM complaints WHERE status IN ('PENDING', 'IN_PROGRESS', 'ASSIGNED')")
            complaints = cursor.fetchall()
            cursor.execute("SELECT * FROM alerts WHERE status IN ('PENDING', 'ASSIGNED')")
            alerts = cursor.fetchall()
            cursor.close()
            conn.close()

            queue = prioritize_collection_queue(bins, complaints, alerts)
            return jsonify({"queue": queue}), 200
        except Exception:
            if conn:
                conn.close()

    # MemoryStore
    queue = prioritize_collection_queue(memory_store.garbage_bins, memory_store.complaints, memory_store.alerts)
    return jsonify({"queue": queue}), 200


@collection_routes.route("/collections", methods=["GET"])
def get_collections():
    """Returns chronological collection history records."""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT ch.*, b.bin_code, b.location, auth.full_name AS authority_name
                FROM collection_history ch
                JOIN garbage_bins b ON ch.bin_id = b.bin_id
                LEFT JOIN authorities auth ON ch.authority_id = auth.authority_id
                ORDER BY ch.collected_at DESC
            """)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            formatted = []
            for r in rows:
                formatted.append({
                    "collection_id": r["collection_id"],
                    "bin_id": r["bin_id"],
                    "bin_code": r["bin_code"],
                    "location": r["location"],
                    "authority_id": r.get("authority_id"),
                    "authority_name": r.get("authority_name") or "Operational Team",
                    "collected_level": float(r.get("collected_level") or 0),
                    "collected_at": str(r.get("collected_at", "Recently")),
                    "remarks": r.get("remarks")
                })
            return jsonify({"collections": formatted}), 200
        except Exception:
            if conn:
                conn.close()

    formatted = []
    for r in memory_store.collection_history:
        formatted.append({
            "collection_id": r["collection_id"],
            "bin_id": r["bin_id"],
            "bin_code": r.get("bin_code", f"BIN-{r['bin_id']:03d}"),
            "location": r.get("location", "Main Station"),
            "authority_id": r.get("authority_id"),
            "authority_name": r.get("authority_name") or "Operational Team",
            "collected_level": float(r.get("collected_level") or 0),
            "collected_at": r.get("collected_at", "Recently"),
            "remarks": r.get("remarks")
        })
    return jsonify({"collections": formatted}), 200


@collection_routes.route("/collections", methods=["POST"])
def record_collection():
    """Authority completes collection: resets bin, saves record, resolves alert."""
    data = request.get_json() or {}
    bin_id = data.get("bin_id")
    authority_id = data.get("authority_id", 1)
    remarks = data.get("remarks", "Bin emptied and sanitized.")
    authority_name = data.get("authority_name", "Authority")

    if not bin_id:
        return jsonify({"message": "Bin ID is required."}), 400

    res = record_bin_collection(bin_id, authority_id, remarks, authority_name)
    if res.get("success"):
        return jsonify(res), 201
    return jsonify({"message": res.get("error", "Collection recording failed")}), 400