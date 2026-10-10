import io
import csv
from flask import Blueprint, jsonify, Response, request
from services.report_service import get_dashboard_summary, get_analytics_data
from database.db import get_db_connection, memory_store

report_routes = Blueprint("report_routes", __name__)


@report_routes.route("/reports", methods=["GET"])
@report_routes.route("/reports/summary", methods=["GET"])
def get_reports():
    summary = get_dashboard_summary()
    analytics = get_analytics_data()
    return jsonify({
        "message": "Report summary ready",
        "summary": summary,
        "analytics": analytics
    }), 200


@report_routes.route("/reports/export", methods=["GET"])
def export_reports():
    """Generates and downloads a CSV export of collection and waste data."""
    export_type = request.args.get("type", "collections")

    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "collections":
        writer.writerow(["Collection ID", "Bin Code", "Location", "Authority Name", "Collected Level (%)", "Timestamp", "Remarks"])
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("""
                    SELECT ch.*, b.bin_code, b.location, auth.full_name AS authority_name
                    FROM collection_history ch
                    JOIN garbage_bins b ON ch.bin_id = b.bin_id
                    LEFT JOIN authorities auth ON ch.authority_id = auth.authority_id
                    ORDER BY ch.collected_at DESC
                """)
                for r in cursor.fetchall():
                    writer.writerow([r["collection_id"], r["bin_code"], r["location"], r.get("authority_name") or "Operational Staff", r["collected_level"], r["collected_at"], r.get("remarks")])
                cursor.close()
                conn.close()
            except Exception:
                if conn:
                    conn.close()
        else:
            for r in memory_store.collection_history:
                writer.writerow([r["collection_id"], r.get("bin_code", f"BIN-{r['bin_id']:03d}"), r.get("location", "Location"), r.get("authority_name", "Staff"), r["collected_level"], r["collected_at"], r.get("remarks")])

        filename = "swcms_collection_report.csv"

    else:  # complaints
        writer.writerow(["Complaint Code", "Citizen Name", "Category", "Location", "Status", "Date Reported", "Resolution Remarks"])
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC")
                for c in cursor.fetchall():
                    writer.writerow([c["complaint_code"], c["citizen_name"], c.get("category"), c["location"], c["status"], c["created_at"], c.get("resolution_remarks")])
                cursor.close()
                conn.close()
            except Exception:
                if conn:
                    conn.close()
        else:
            for c in memory_store.complaints:
                writer.writerow([c["complaint_code"], c["citizen_name"], c.get("category"), c["location"], c["status"], c["created_at"], c.get("resolution_remarks")])

        filename = "swcms_complaints_report.csv"

    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response