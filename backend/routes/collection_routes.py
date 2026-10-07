from flask import Blueprint, jsonify

collection_routes = Blueprint("collection_routes", __name__)


@collection_routes.route("/collections", methods=["GET"])
def get_collections():
    return jsonify({
        "message": "Collection endpoint ready",
        "collections": []
    }), 200