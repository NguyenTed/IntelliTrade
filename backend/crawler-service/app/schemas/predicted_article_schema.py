from pydantic import BaseModel, Field
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
from app.schemas.section_schema import SectionSchema
from app.schemas.symbol_schema import SymbolSchema
from app.schemas.tag_schema import TagSchema

class PredictedArticleSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    title: Optional[str] = ""
    description: Optional[str] = ""
    content: Optional[List[str]] = []
    comments: Optional[List[ObjectId]] = []
    url: str
    tradeSide: Optional[str] = ""
    contentHtml: Optional[str] = ""
    tags: Optional[List[str]] = []
    symbols: Optional[List[ObjectId]] = []
    sections: Optional[List[SectionSchema]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }