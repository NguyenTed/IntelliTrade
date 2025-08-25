
from db.models.comment_model import insert_comment, find_one_comment_by_id
from db.models.predicted_idea_model import add_comment
from app.schemas.comment_schema import CommentSchema
from enums.ArticleType import ArticleType
from app.requests.comment_request import CommentRequest
from datetime import datetime
from app.responses.comment_response import CommentResponse

class CommentService:
    @staticmethod
    def save_comment(comment_request: CommentRequest):
        formatted_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        comment: CommentSchema = CommentSchema(
            parent_id=comment_request.parent_id,
            author=comment_request.author,
            text=comment_request.text,
            timestamp = formatted_timestamp

        )
        inserted_id = insert_comment(comment)
        add_comment(comment_request.article_id, inserted_id)
        new_comment: CommentSchema = find_one_comment_by_id(inserted_id)
        comment_response = CommentResponse(
            id=str(new_comment.id),
            comment_id=new_comment.comment_id,
            parent_id=new_comment.parent_id,
            author=new_comment.author,
            text=new_comment.text,
            timestamp=new_comment.timestamp
        )
        return comment_response
    
    