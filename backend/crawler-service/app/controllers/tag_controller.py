from flask import Flask, jsonify, Blueprint, request
from app.services.tag_service import TagService


tag_bp = Blueprint("tag", __name__)

@tag_bp.route("/crawler/tag/search", methods=["GET"])
def search_tags():
    keyword = request.args.get("keyword", "")
    tags = TagService.find_tag_by_keyword(keyword)
    return jsonify([tag.model_dump() for tag in tags])
