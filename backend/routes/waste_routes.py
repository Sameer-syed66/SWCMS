from flask import Blueprint, request, jsonify
from services.waste_monitoring_service import (
    process_waste_reading,
    simulate_citywide_tick,
    simulator_engine,
    reset_bins_distribution
)
from database.db import get_db_connection, memory_store

waste_routes = Blueprint("waste_routes", __name__)


@waste_routes.route("/waste/simulation/reset", methods=["POST"])
def reset_simulation():
    """Reset bin levels to initial operational spread."""
    res = reset_bins_distribution()
    return jsonify({
        "message": "Bins reset successfully",
        "data": res
    }), 200


@waste_routes.route("/waste/simulate", methods=["POST"])
def simulate_reading():
    """Simulate an individual sensor reading update for a bin."""
    data = request.get_json() or {}
    bin_id = data.get("bin_id")
    waste_level = data.get("waste_level")

    if bin_id is None or waste_level is None:
        return jsonify({"message": "bin_id and waste_level (0-100) are required."}), 400

    try:
        waste_level = float(waste_level)
    except ValueError:
        return jsonify({"message": "waste_level must be a numeric value."}), 400

    res = process_waste_reading(bin_id, waste_level)
    if res.get("success"):
        return jsonify({
            "message": "Waste reading processed successfully",
            "data": res
        }), 200
    return jsonify({"message": res.get("error", "Failed to process reading")}), 400


@waste_routes.route("/waste/simulation/tick", methods=["POST"])
def manual_tick():
    """Manually advance sensor readings for all active bins by one simulation cycle."""
    res = simulate_citywide_tick()
    return jsonify({
        "message": "Citywide simulation cycle executed",
        "data": res
    }), 200


@waste_routes.route("/waste/simulation/start", methods=["POST"])
def start_simulation():
    """Start continuous real-time background simulation."""
    data = request.get_json() or {}
    interval = data.get("interval_seconds", 4)
    started = simulator_engine.start(interval=interval)
    return jsonify({
        "message": "Real-time background simulation started" if started else "Simulator already running",
        "status": simulator_engine.status()
    }), 200


@waste_routes.route("/waste/simulation/stop", methods=["POST"])
def stop_simulation():
    """Stop continuous real-time background simulation."""
    simulator_engine.stop()
    return jsonify({
        "message": "Real-time background simulation paused",
        "status": simulator_engine.status()
    }), 200


@waste_routes.route("/waste/simulation/status", methods=["GET"])
def get_simulation_status():
    """Get status of the real-time background simulator."""
    return jsonify({
        "status": simulator_engine.status()
    }), 200


@waste_routes.route("/waste/readings/<int:bin_id>", methods=["GET"])
def get_readings_for_bin(bin_id):
    """Returns recent sensor readings for a bin."""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM waste_level_records WHERE bin_id = %s ORDER BY recorded_at DESC LIMIT 20",
                (bin_id,)
            )
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"readings": rows}), 200
        except Exception:
            if conn:
                conn.close()

    rows = [r for r in memory_store.waste_level_records if r["bin_id"] == bin_id]
    return jsonify({"readings": rows[-20:]}), 200