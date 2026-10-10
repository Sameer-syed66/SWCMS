from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from database.db import get_db_connection, memory_store
from services.report_service import get_dashboard_summary, get_analytics_data

admin_routes = Blueprint("admin_routes", __name__)


@admin_routes.route("/admin/dashboard", methods=["GET"])
def admin_dashboard():
    summary = get_dashboard_summary()
    analytics = get_analytics_data()
    return jsonify({
        "summary": summary,
        "analytics": analytics
    }), 200


@admin_routes.route("/admin/authorities", methods=["GET"])
def get_authorities():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT authority_id, username, full_name, email, phone, area, status, created_at FROM authorities ORDER BY authority_id ASC")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"authorities": rows}), 200
        except Exception:
            if conn:
                conn.close()

    # MemoryStore
    safe_list = [
        {
            "authority_id": a["authority_id"],
            "username": a["username"],
            "full_name": a["full_name"],
            "email": a["email"],
            "phone": a.get("phone", ""),
            "area": a.get("area", "Central Zone"),
            "status": a.get("status", "ACTIVE"),
            "created_at": a.get("created_at")
        }
        for a in memory_store.authorities
    ]
    return jsonify({"authorities": safe_list}), 200


@admin_routes.route("/admin/authorities", methods=["POST"])
def create_authority():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password") or "Authority@123"
    full_name = data.get("full_name") or data.get("name")
    email = data.get("email")
    phone = data.get("phone", "")
    area = data.get("area", "Central Zone")

    if not username or not full_name or not email:
        return jsonify({"message": "Username, full name, and email are required."}), 400

    password_hash = generate_password_hash(password)

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                INSERT INTO authorities (username, password_hash, full_name, email, phone, area, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'ACTIVE')
                """,
                (username, password_hash, full_name, email, phone, area)
            )
            new_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Authority created successfully", "authority_id": new_id}), 201
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    new_id = len(memory_store.authorities) + 1
    new_auth = {
        "authority_id": new_id,
        "username": username,
        "password_hash": password_hash,
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "area": area,
        "status": "ACTIVE",
        "created_at": "Just now"
    }
    memory_store.authorities.append(new_auth)
    return jsonify({"message": "Authority created successfully", "authority_id": new_id, "authority": new_auth}), 201


@admin_routes.route("/admin/authorities/<int:authority_id>/status", methods=["PUT"])
def toggle_authority_status(authority_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ("ACTIVE", "INACTIVE"):
        return jsonify({"message": "Status must be ACTIVE or INACTIVE"}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("UPDATE authorities SET status = %s WHERE authority_id = %s", (new_status, authority_id))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": f"Authority status updated to {new_status}"}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    target = next((a for a in memory_store.authorities if a["authority_id"] == authority_id), None)
    if target:
        target["status"] = new_status
        return jsonify({"message": f"Authority status updated to {new_status}"}), 200

    return jsonify({"message": "Authority not found"}), 404


@admin_routes.route("/admin/authorities/<int:authority_id>/approve", methods=["PUT", "POST"])
def approve_authority(authority_id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT full_name, username FROM authorities WHERE authority_id = %s", (authority_id,))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                conn.close()
                return jsonify({"message": "Authority not found"}), 404

            cursor.execute("UPDATE authorities SET status = 'ACTIVE' WHERE authority_id = %s", (authority_id,))
            cursor.execute(
                """
                INSERT INTO notifications (authority_id, title, message, is_read)
                VALUES (%s, 'Authority Approved', %s, FALSE)
                """,
                (authority_id, f"Authority account for {user['full_name']} (@{user['username']}) has been approved and activated.")
            )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": f"Authority '{user['full_name']}' approved and activated successfully."}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    target = next((a for a in memory_store.authorities if a["authority_id"] == authority_id), None)
    if target:
        target["status"] = "ACTIVE"
        memory_store.notifications.insert(0, {
            "notification_id": max([n.get("notification_id", 0) for n in memory_store.notifications] or [0]) + 1,
            "authority_id": authority_id,
            "title": "Authority Approved",
            "message": f"Authority account for {target['full_name']} (@{target['username']}) has been approved and activated.",
            "priority": "MEDIUM",
            "is_read": False,
            "created_at": "Just now"
        })
        return jsonify({"message": f"Authority '{target['full_name']}' approved and activated successfully."}), 200

    return jsonify({"message": "Authority not found"}), 404


@admin_routes.route("/admin/authorities/<int:authority_id>/reject", methods=["PUT", "POST"])
@admin_routes.route("/admin/authorities/<int:authority_id>", methods=["DELETE"])
def reject_or_delete_authority(authority_id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT full_name, username FROM authorities WHERE authority_id = %s", (authority_id,))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                conn.close()
                return jsonify({"message": "Authority not found"}), 404

            cursor.execute("DELETE FROM authorities WHERE authority_id = %s", (authority_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": f"Authority registration for '{user['full_name']}' was removed."}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    target = next((a for a in memory_store.authorities if a["authority_id"] == authority_id), None)
    if target:
        memory_store.authorities.remove(target)
        return jsonify({"message": f"Authority registration for '{target['full_name']}' was removed."}), 200

    return jsonify({"message": "Authority not found"}), 404


@admin_routes.route("/admin/settings", methods=["GET"])
def get_settings():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT setting_key, setting_value, description FROM system_settings")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            settings = {r["setting_key"]: r["setting_value"] for r in rows}
            return jsonify({"settings": settings}), 200
        except Exception:
            if conn:
                conn.close()

    return jsonify({"settings": memory_store.system_settings}), 200


@admin_routes.route("/admin/settings", methods=["PUT"])
def update_settings():
    data = request.get_json() or {}
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            for k, v in data.items():
                cursor.execute(
                    """
                    INSERT INTO system_settings (setting_key, setting_value)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                    """,
                    (k, str(v))
                )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Settings updated successfully"}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    for k, v in data.items():
        memory_store.system_settings[k] = str(v)
    return jsonify({"message": "Settings updated successfully"}), 200