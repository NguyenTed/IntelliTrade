from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from enums.ArticleType import ArticleType
from typing import Dict, Any, List, Union


class IdeaSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    slug: str
    html: str
    url: str
    imgUrl: Optional[str] = ""
    raw_comment: Optional[Union[List[Dict[str, Any]], Dict[str, Any]]] = None
    source: ArticleType
    predicted: Optional[ObjectId] = None

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }