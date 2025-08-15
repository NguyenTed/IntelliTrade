from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.section_schema import SectionSchema
from app.schemas.symbol_schema import SymbolSchema
from app.schemas.tag_schema import TagSchema
from app.schemas.comment_schema import CommentSchema
from app.responses.comment_response import CommentResponse
from app.responses.symbol_response import SymbolResponse

class PredictedArticleResponse(BaseModel):
    id: str
    title: Optional[str] = ""
    description: Optional[str] = ""
    imgUrl: Optional[str] = ""
    content: Optional[List[str]] = []
    slug: Optional[str] = None
    comments: Optional[List[CommentResponse]] = []
    url: str
    tags: Optional[List[str]] = []
    tradeSide: Optional[str] = ""
    symbols: Optional[List[SymbolSchema]] = []
    sections: Optional[List[SectionSchema]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
