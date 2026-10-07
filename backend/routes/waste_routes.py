from flask import Blueprint, jsonify

waste_routes = Blueprint("waste_routes", __name__)


@waste_routes.route("/waste", methods=["GET"])
def get_waste():
    return jsonify({
        "message": "Waste monitoring endpoint ready"
    }), 200