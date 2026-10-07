from flask import Blueprint, jsonify

report_routes = Blueprint("report_routes", __name__)


@report_routes.route("/reports", methods=["GET"])
def get_reports():
    return jsonify({
        "message": "Reports endpoint ready",
        "reports": []
    }), 200