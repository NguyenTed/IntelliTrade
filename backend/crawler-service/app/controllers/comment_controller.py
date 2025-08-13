from flask import Flask, jsonify, Blueprint
from app.services.comment_service import CommentService
from app.requests.page_request import PageRequest
from app.schemas.comment_schema import CommentSchema
from app.requests.comment_request import CommentRequest

comment_bp = Blueprint("comment", __name__)

@comment_bp.route("/crawler/comment", methods=["POST"])
def save_comment():
    comment_request = CommentRequest.from_flask()
    comment = CommentService.save_comment(comment_request)
    data = comment.model_dump(by_alias=True)
    return jsonify(data), 201
    
    


