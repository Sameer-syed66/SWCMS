from flask import Blueprint, request, jsonify

auth_routes = Blueprint("auth_routes", __name__)


@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    return jsonify({
        "message": "Login endpoint ready",
        "email": email
    }), 200