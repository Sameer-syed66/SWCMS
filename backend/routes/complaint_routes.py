from flask import Blueprint, request, jsonify

complaint_routes = Blueprint("complaint_routes", __name__)


@complaint_routes.route("/complaints", methods=["GET"])
def get_complaints():
    return jsonify({
        "message": "Complaints endpoint ready",
        "complaints": []
    }), 200


@complaint_routes.route("/complaints", methods=["POST"])
def create_complaint():
    data = request.get_json()

    return jsonify({
        "message": "Complaint received",
        "data": data
    }), 201