from flask import Blueprint, jsonify

authority_routes = Blueprint("authority_routes", __name__)


@authority_routes.route("/authority", methods=["GET"])
def authority_home():
    return jsonify({
        "message": "Authority endpoint ready"
    }), 200