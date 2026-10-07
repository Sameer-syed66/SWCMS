from flask import Blueprint, jsonify

admin_routes = Blueprint("admin_routes", __name__)


@admin_routes.route("/admin", methods=["GET"])
def admin_home():
    return jsonify({
        "message": "Admin endpoint ready"
    }), 200