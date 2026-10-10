from flask import Blueprint, request, jsonify
from utils.authentication import authenticate_user, require_role

auth_routes = Blueprint("auth_routes", __name__)


@auth_routes.route("/login", methods=["POST"])
@auth_routes.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username_or_email = data.get("email") or data.get("username")
    password = data.get("password")
    role = data.get("role", "authority").lower()

    if not username_or_email or not password:
        return jsonify({"message": "Email/Username and password are required", "error": "missing_fields"}), 400

    result = authenticate_user(username_or_email, password, role)
    if result.get("success"):
        return jsonify({
            "message": "Login successful",
            "token": result["token"],
            "user": result["user"]
        }), 200
    else:
        return jsonify({
            "message": result.get("error", "Authentication failed"),
            "error": "invalid_credentials"
        }), 401


@auth_routes.route("/me", methods=["GET"])
@auth_routes.route("/auth/me", methods=["GET"])
@require_role(["admin", "authority"])
def get_current_user():
    return jsonify({
        "user": request.current_user
    }), 200