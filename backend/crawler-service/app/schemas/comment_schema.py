from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field

class CommentSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    comment_id: Optional[int] = None
    parent_id: Optional[int] = None
    author: Optional[str] = None
    text: str
    timestamp: Optional[str] = None

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }