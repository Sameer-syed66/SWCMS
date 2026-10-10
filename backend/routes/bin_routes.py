from flask import Blueprint, request, jsonify
from database.db import get_db_connection, memory_store

bin_routes = Blueprint("bin_routes", __name__)


@bin_routes.route("/bins", methods=["GET"])
def get_bins():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM garbage_bins ORDER BY bin_id ASC")
            bins = cursor.fetchall()
            cursor.close()
            conn.close()
            # Map database keys to frontend-friendly keys
            formatted = []
            for b in bins:
                formatted.append({
                    "id": b["bin_code"],
                    "bin_id": b["bin_id"],
                    "bin_code": b["bin_code"],
                    "location": b["location"],
                    "area": b.get("area", "Central Zone"),
                    "level": float(b.get("current_level") or 0),
                    "current_level": float(b.get("current_level") or 0),
                    "status": b.get("status", "NORMAL"),
                    "operational_status": b.get("operational_status", "ACTIVE"),
                    "warning_threshold": float(b.get("warning_threshold") or 70),
                    "critical_threshold": float(b.get("critical_threshold") or 85),
                    "capacity": b.get("capacity", 100),
                    "lastUpdated": str(b.get("last_updated", "Recently"))
                })
            return jsonify({"message": "Bins fetched successfully", "bins": formatted}), 200
        except Exception:
            if conn:
                conn.close()

    # MemoryStore
    formatted = []
    for b in memory_store.garbage_bins:
        formatted.append({
            "id": b["bin_code"],
            "bin_id": b["bin_id"],
            "bin_code": b["bin_code"],
            "location": b["location"],
            "area": b.get("area", "Central Zone"),
            "level": float(b.get("current_level") or 0),
            "current_level": float(b.get("current_level") or 0),
            "status": b.get("status", "NORMAL"),
            "operational_status": b.get("operational_status", "ACTIVE"),
            "warning_threshold": float(b.get("warning_threshold") or 70),
            "critical_threshold": float(b.get("critical_threshold") or 85),
            "capacity": b.get("capacity", 100),
            "lastUpdated": b.get("last_updated", "Recently")
        })
    return jsonify({"message": "Bins fetched successfully", "bins": formatted}), 200


@bin_routes.route("/bins/<int:bin_id>", methods=["GET"])
def get_bin_by_id(bin_id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM garbage_bins WHERE bin_id = %s", (bin_id,))
            b = cursor.fetchone()
            cursor.close()
            conn.close()
            if b:
                return jsonify({"bin": b}), 200
            return jsonify({"message": "Bin not found"}), 404
        except Exception:
            if conn:
                conn.close()

    b = next((x for x in memory_store.garbage_bins if x["bin_id"] == bin_id), None)
    if b:
        return jsonify({"bin": b}), 200
    return jsonify({"message": "Bin not found"}), 404


@bin_routes.route("/bins", methods=["POST"])
def create_bin():
    data = request.get_json() or {}
    bin_code = data.get("bin_code") or data.get("id")
    location = data.get("location")
    area = data.get("area", "Central Zone")
    warning_threshold = float(data.get("warning_threshold") or 70)
    critical_threshold = float(data.get("critical_threshold") or 85)
    capacity = int(data.get("capacity") or 100)

    if not bin_code or not location:
        return jsonify({"message": "Bin code and location are required."}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                INSERT INTO garbage_bins (bin_code, location, area, warning_threshold, critical_threshold, capacity, status, operational_status)
                VALUES (%s, %s, %s, %s, %s, %s, 'NORMAL', 'ACTIVE')
                """,
                (bin_code, location, area, warning_threshold, critical_threshold, capacity)
            )
            new_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Bin created successfully", "bin_id": new_id}), 201
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    new_id = len(memory_store.garbage_bins) + 1
    new_bin = {
        "bin_id": new_id,
        "bin_code": bin_code,
        "location": location,
        "area": area,
        "capacity": capacity,
        "current_level": 0.0,
        "warning_threshold": warning_threshold,
        "critical_threshold": critical_threshold,
        "status": "NORMAL",
        "operational_status": "ACTIVE",
        "last_updated": "Just now"
    }
    memory_store.garbage_bins.append(new_bin)
    return jsonify({"message": "Bin created successfully", "bin_id": new_id, "bin": new_bin}), 201


@bin_routes.route("/bins/<int:bin_id>", methods=["PUT"])
def update_bin(bin_id):
    data = request.get_json() or {}
    location = data.get("location")
    area = data.get("area")
    warning_threshold = data.get("warning_threshold")
    critical_threshold = data.get("critical_threshold")
    operational_status = data.get("operational_status")

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            updates = []
            params = []
            if location:
                updates.append("location = %s")
                params.append(location)
            if area:
                updates.append("area = %s")
                params.append(area)
            if warning_threshold is not None:
                updates.append("warning_threshold = %s")
                params.append(float(warning_threshold))
            if critical_threshold is not None:
                updates.append("critical_threshold = %s")
                params.append(float(critical_threshold))
            if operational_status:
                updates.append("operational_status = %s")
                params.append(operational_status)

            if updates:
                params.append(bin_id)
                query = f"UPDATE garbage_bins SET {', '.join(updates)} WHERE bin_id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Bin updated successfully"}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    target = next((b for b in memory_store.garbage_bins if b["bin_id"] == bin_id), None)
    if target:
        if location: target["location"] = location
        if area: target["area"] = area
        if warning_threshold is not None: target["warning_threshold"] = float(warning_threshold)
        if critical_threshold is not None: target["critical_threshold"] = float(critical_threshold)
        if operational_status: target["operational_status"] = operational_status
        return jsonify({"message": "Bin updated successfully", "bin": target}), 200

    return jsonify({"message": "Bin not found"}), 404