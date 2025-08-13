from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.section_schema import SectionSchema
from app.schemas.symbol_schema import SymbolSchema
from app.schemas.tag_schema import TagSchema
from app.schemas.comment_schema import CommentSchema
from app.responses.comment_response import CommentResponse

class PredictedArticleResponse(BaseModel):
    id: str
    title: Optional[str] = ""
    description: Optional[str] = ""
    imgUrl: Optional[str] = ""
    content: Optional[List[str]] = []
    comments: Optional[List[CommentResponse]] = None
    url: str
    tags: Optional[List[str]] = []
    symbols: Optional[List[str]] = []
    sections: Optional[List[SectionSchema]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
