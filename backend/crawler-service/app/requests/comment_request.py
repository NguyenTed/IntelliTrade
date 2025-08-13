from pydantic import BaseModel, Field, ValidationError
from flask import request
from typing import Optional
class CommentRequest(BaseModel):
    article_id: str 
    parent_id: Optional[int] = Field(default=-1)
    author: str
    text: str

    @classmethod
    def from_flask(cls):
        return cls(**request.get_json())

