from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from enums.ArticleType import ArticleType
from typing import Dict, Any, List, Union


class NewsSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    slug: str
    html: str
    url: str
    imgUrl: Optional[str] = ""
    source: ArticleType
    predicted: Optional[ObjectId] = None

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }