"""
SWCMS Authentication & Role-Based Authorization
JWT token generation, verification, password hashing, and endpoint protection.
"""

import os
import datetime
from functools import wraps
from flask import request, jsonify
import jwt
from werkzeug.security import check_password_hash
from database.db import get_db_connection, memory_store

JWT_SECRET = os.getenv("SECRET_KEY", "swcms-super-secret-jwt-key-for-sha256-production-grade-2026")
JWT_ALGORITHM = "HS256"


def create_access_token(user_id, username, role, full_name, email=None):
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "name": full_name,
        "email": email,
        "exp": now + datetime.timedelta(days=7),
        "iat": now
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def authenticate_user(username_or_email, password, role="authority"):
    """
    Authenticate against administrators or authorities table with password hashing
    and inactive account checks.
    """
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            if role == "admin":
                cursor.execute(
                    "SELECT * FROM administrators WHERE username = %s OR email = %s LIMIT 1",
                    (username_or_email, username_or_email)
                )
                user = cursor.fetchone()
                cursor.close()
                conn.close()

                if user and check_password_hash(user["password_hash"], password):
                    token = create_access_token(user["admin_id"], user["username"], "admin", user["full_name"], user["email"])
                    return {
                        "success": True,
                        "token": token,
                        "user": {
                            "id": user["admin_id"],
                            "username": user["username"],
                            "name": user["full_name"],
                            "email": user["email"],
                            "role": "admin"
                        }
                    }
                return {"success": False, "error": "Invalid administrator username or password."}

            else:  # authority
                cursor.execute(
                    "SELECT * FROM authorities WHERE username = %s OR email = %s LIMIT 1",
                    (username_or_email, username_or_email)
                )
                user = cursor.fetchone()
                cursor.close()
                conn.close()

                if not user:
                    return {"success": False, "error": "Authority account not found."}
                if user.get("status") == "INACTIVE":
                    return {"success": False, "error": "This authority account has been deactivated. Contact the administrator."}
                if check_password_hash(user["password_hash"], password):
                    token = create_access_token(user["authority_id"], user["username"], "authority", user["full_name"], user["email"])
                    return {
                        "success": True,
                        "token": token,
                        "user": {
                            "id": user["authority_id"],
                            "username": user["username"],
                            "name": user["full_name"],
                            "email": user["email"],
                            "area": user.get("area"),
                            "role": "authority"
                        }
                    }
                return {"success": False, "error": "Invalid authority username or password."}

        except Exception as e:
            if conn:
                conn.close()

    # MemoryStore fallback
    if role == "admin":
        user = next((a for a in memory_store.administrators if a["username"] == username_or_email or a["email"] == username_or_email), None)
        if user and check_password_hash(user["password_hash"], password):
            token = create_access_token(user["admin_id"], user["username"], "admin", user["full_name"], user["email"])
            return {
                "success": True,
                "token": token,
                "user": {
                    "id": user["admin_id"],
                    "username": user["username"],
                    "name": user["full_name"],
                    "email": user["email"],
                    "role": "admin"
                }
            }
        return {"success": False, "error": "Invalid administrator credentials (default: admin / Admin@123)."}

    else:
        user = next((a for a in memory_store.authorities if a["username"] == username_or_email or a["email"] == username_or_email), None)
        if not user:
            return {"success": False, "error": "Authority not found (default: authority1 / Authority@123)."}
        if user.get("status") == "INACTIVE":
            return {"success": False, "error": "This authority account is inactive."}
        if check_password_hash(user["password_hash"], password):
            token = create_access_token(user["authority_id"], user["username"], "authority", user["full_name"], user["email"])
            return {
                "success": True,
                "token": token,
                "user": {
                    "id": user["authority_id"],
                    "username": user["username"],
                    "name": user["full_name"],
                    "email": user["email"],
                    "area": user.get("area"),
                    "role": "authority"
                }
            }
        return {"success": False, "error": "Invalid authority password (default: Authority@123)."}


def require_role(allowed_roles=None):
    """Decorator to enforce JWT authentication and role authorization."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"message": "Authorization token required", "error": "unauthorized"}), 401

            token = auth_header.split(" ")[1]
            decoded = decode_access_token(token)
            if not decoded:
                return jsonify({"message": "Invalid or expired session token", "error": "invalid_token"}), 401

            if allowed_roles and decoded.get("role") not in allowed_roles:
                return jsonify({"message": "Access forbidden: insufficient role permissions", "error": "forbidden"}), 403

            request.current_user = decoded
            return fn(*args, **kwargs)
        return wrapper
    return decorator