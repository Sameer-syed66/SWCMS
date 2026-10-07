from flask import Blueprint, jsonify

notification_routes = Blueprint("notification_routes", __name__)


@notification_routes.route("/notifications", methods=["GET"])
def get_notifications():
    return jsonify({
        "message": "Notification endpoint ready",
        "notifications": []
    }), 200