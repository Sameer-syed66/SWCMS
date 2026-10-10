import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from database.db import get_db_connection, memory_store
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


@auth_routes.route("/register-authority", methods=["POST"])
@auth_routes.route("/auth/register-authority", methods=["POST"])
def register_authority():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    area = (data.get("area") or "Central Zone").strip()

    if not username or not password or not full_name or not email:
        return jsonify({
            "message": "Username, password, full name, and email are all required.",
            "error": "missing_fields"
        }), 400

    if len(username) < 3:
        return jsonify({
            "message": "Username must be at least 3 characters long.",
            "error": "invalid_username"
        }), 400

    if len(password) < 6:
        return jsonify({
            "message": "Password must be at least 6 characters long.",
            "error": "weak_password"
        }), 400

    password_hash = generate_password_hash(password)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT authority_id FROM authorities WHERE username = %s OR email = %s", (username, email))
            existing_auth = cursor.fetchone()
            if existing_auth:
                cursor.close()
                conn.close()
                return jsonify({"message": "An authority with this username or email already exists.", "error": "duplicate_user"}), 409

            cursor.execute("SELECT admin_id FROM administrators WHERE username = %s OR email = %s", (username, email))
            existing_admin = cursor.fetchone()
            if existing_admin:
                cursor.close()
                conn.close()
                return jsonify({"message": "This username or email is reserved.", "error": "reserved_user"}), 409

            cursor.execute(
                """
                INSERT INTO authorities (username, password_hash, full_name, email, phone, area, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'INACTIVE')
                """,
                (username, password_hash, full_name, email, phone, area)
            )
            new_id = cursor.lastrowid

            cursor.execute(
                """
                INSERT INTO notifications (authority_id, title, message, is_read)
                VALUES (NULL, 'Authority Registration Request', %s, FALSE)
                """,
                (f"New registration request from {full_name} (@{username}) for {area}. Administrator approval required before login.",)
            )
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({
                "message": "Registration submitted successfully! Your account is pending Administrator approval. You will be able to log in once an administrator approves your request.",
                "status": "pending_approval",
                "authority_id": new_id
            }), 201

        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return jsonify({"message": f"Database error during registration: {e}", "error": "db_error"}), 500

    # MemoryStore fallback
    if any(a["username"].lower() == username.lower() or a["email"].lower() == email.lower() for a in memory_store.authorities):
        return jsonify({"message": "An authority with this username or email already exists.", "error": "duplicate_user"}), 409
    if any(a["username"].lower() == username.lower() or a["email"].lower() == email.lower() for a in memory_store.administrators):
        return jsonify({"message": "This username or email is reserved.", "error": "reserved_user"}), 409

    new_id = max([a["authority_id"] for a in memory_store.authorities] or [0]) + 1
    new_auth = {
        "authority_id": new_id,
        "username": username,
        "password_hash": password_hash,
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "area": area,
        "status": "INACTIVE",
        "created_at": now_str
    }
    memory_store.authorities.append(new_auth)

    notif_id = max([n.get("notification_id", 0) for n in memory_store.notifications] or [0]) + 1
    memory_store.notifications.insert(0, {
        "notification_id": notif_id,
        "authority_id": None,
        "title": "Authority Registration Request",
        "message": f"New registration request from {full_name} (@{username}) for {area}. Administrator approval required before login.",
        "priority": "HIGH",
        "is_read": False,
        "created_at": now_str
    })

    return jsonify({
        "message": "Registration submitted successfully! Your account is pending Administrator approval. You will be able to log in once an administrator approves your request.",
        "status": "pending_approval",
        "authority_id": new_id
    }), 201


@auth_routes.route("/me", methods=["GET"])
@auth_routes.route("/auth/me", methods=["GET"])
@require_role(["admin", "authority"])
def get_current_user():
    return jsonify({
        "user": request.current_user
    }), 200