from flask import Blueprint, jsonify
from database.db import get_db_connection, memory_store

notification_routes = Blueprint("notification_routes", __name__)


@notification_routes.route("/notifications", methods=["GET"])
def get_notifications():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            unread_count = sum(1 for n in rows if not n.get("is_read"))
            return jsonify({"notifications": rows, "unread_count": unread_count}), 200
        except Exception:
            if conn:
                conn.close()

    unread_count = sum(1 for n in memory_store.notifications if not n.get("is_read"))
    return jsonify({"notifications": memory_store.notifications, "unread_count": unread_count}), 200


@notification_routes.route("/notifications/<int:notif_id>/read", methods=["PUT"])
def mark_read(notif_id):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("UPDATE notifications SET is_read = TRUE WHERE notification_id = %s", (notif_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Notification marked as read"}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    target = next((n for n in memory_store.notifications if n["notification_id"] == notif_id), None)
    if target:
        target["is_read"] = True
        return jsonify({"message": "Notification marked as read"}), 200

    return jsonify({"message": "Notification not found"}), 404


@notification_routes.route("/notifications/read-all", methods=["PUT"])
def mark_all_read():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("UPDATE notifications SET is_read = TRUE")
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "All notifications marked as read"}), 200
        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Error: {e}"}), 400

    for n in memory_store.notifications:
        n["is_read"] = True
    return jsonify({"message": "All notifications marked as read"}), 200