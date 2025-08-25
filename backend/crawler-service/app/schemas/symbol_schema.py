from pydantic import BaseModel, Field
from enums.ArticleType import ArticleType
from typing import Optional
from bson import ObjectId

class SymbolSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    name: str
    source: ArticleType
    symbolImgs: Optional[list[str]] = []

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True,
        "json_encoders": {
         ObjectId: str
        }
    }