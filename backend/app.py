import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database.db import test_db_connection

try:
    from routes.auth_routes import auth_routes
    from routes.admin_routes import admin_routes
    from routes.authority_routes import authority_routes
    from routes.bin_routes import bin_routes
    from routes.waste_routes import waste_routes
    from routes.alert_routes import alert_routes
    from routes.complaint_routes import complaint_routes
    from routes.collection_routes import collection_routes
    from routes.notification_routes import notification_routes
    from routes.report_routes import report_routes
except ImportError:
    from backend.routes.auth_routes import auth_routes
    from backend.routes.admin_routes import admin_routes
    from backend.routes.authority_routes import authority_routes
    from backend.routes.bin_routes import bin_routes
    from backend.routes.waste_routes import waste_routes
    from backend.routes.alert_routes import alert_routes
    from backend.routes.complaint_routes import complaint_routes
    from backend.routes.collection_routes import collection_routes
    from backend.routes.notification_routes import notification_routes
    from backend.routes.report_routes import report_routes

app = Flask(__name__)

CORS(app)

blueprints = [
    ("auth", auth_routes),
    ("admin", admin_routes),
    ("authority", authority_routes),
    ("bin", bin_routes),
    ("waste", waste_routes),
    ("alert", alert_routes),
    ("complaint", complaint_routes),
    ("collection", collection_routes),
    ("notification", notification_routes),
    ("report", report_routes),
]

# Register blueprints for both root and /api prefixes
for name, bp in blueprints:
    app.register_blueprint(bp)
    app.register_blueprint(bp, url_prefix="/api", name=f"{name}_api")


@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "SWCMS Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth/login",
            "bins": "/api/bins",
            "alerts": "/api/alerts",
            "complaints": "/api/complaints",
            "collections": "/api/collections",
            "waste_simulation": "/api/waste/simulate",
            "reports": "/api/reports"
        }
    }), 200


@app.route("/health")
@app.route("/api/health")
@app.route("/api/db-test")
def health_check():
    db_status = test_db_connection()
    return jsonify({
        "service": "SWCMS Backend API",
        "status": "healthy",
        "database": db_status
    }), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT") or os.getenv("FLASK_PORT") or 5000)
    is_dev = os.getenv("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=is_dev)