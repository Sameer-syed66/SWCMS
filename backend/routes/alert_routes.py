from flask import Blueprint, jsonify

alert_routes = Blueprint("alert_routes", __name__)


@alert_routes.route("/alerts", methods=["GET"])
def get_alerts():
    return jsonify({
        "message": "Alerts endpoint ready",
        "alerts": []
    }), 200