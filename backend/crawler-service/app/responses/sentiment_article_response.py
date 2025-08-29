from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.section_schema import SectionSchema
from app.schemas.symbol_schema import SymbolSchema
from app.schemas.sentiment_schema import SentimentSchema
from app.responses.comment_response import CommentResponse


class SentimentArticleResponse(BaseModel):
    id: str
    title: Optional[str] = ""
    content: Optional[List[str]] = []
    url: str
    tags: Optional[List[str]] = []
    tradeSide: Optional[str] = ""
    symbols: Optional[List[SymbolSchema]] = []
    sentiment: Optional[SentimentSchema] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
