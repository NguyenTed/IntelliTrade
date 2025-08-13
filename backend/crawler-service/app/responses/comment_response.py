from pydantic import BaseModel
from typing import Optional

class CommentResponse(BaseModel):
    id: str
    comment_id: Optional[int] = None
    parent_id: Optional[int] = None
    author: str
    text: str
    timestamp: str
