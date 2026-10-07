from flask import Flask
from flask_cors import CORS

from SWMMS.backend.routes.auth_routes import auth_routes
from SWMMS.backend.routes.admin_routes import admin_routes
from SWMMS.backend.routes.authority_routes import authority_routes
from SWMMS.backend.routes.bin_routes import bin_routes
from SWMMS.backend.routes.waste_routes import waste_routes
from SWMMS.backend.routes.alert_routes import alert_routes
from SWMMS.backend.routes.complaint_routes import complaint_routes
from SWMMS.backend.routes.collection_routes import collection_routes
from SWMMS.backend.routes.notification_routes import notification_routes
from SWMMS.backend.routes.report_routes import report_routes


app = Flask(__name__)

CORS(app)


# Register API routes
app.register_blueprint(auth_routes)
app.register_blueprint(admin_routes)
app.register_blueprint(authority_routes)
app.register_blueprint(bin_routes)
app.register_blueprint(waste_routes)
app.register_blueprint(alert_routes)
app.register_blueprint(complaint_routes)
app.register_blueprint(collection_routes)
app.register_blueprint(notification_routes)
app.register_blueprint(report_routes)


@app.route("/")
def home():
    return "SWCMS Backend is running"


if __name__ == "__main__":
    app.run(debug=True)