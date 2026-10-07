from flask import Blueprint, jsonify

bin_routes = Blueprint("bin_routes", __name__)


@bin_routes.route("/bins", methods=["GET"])
def get_bins():
    return jsonify({
        "message": "Bins endpoint ready",
        "bins": []
    }), 200