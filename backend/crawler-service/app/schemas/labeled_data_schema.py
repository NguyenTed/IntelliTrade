from pydantic import BaseModel, Field
from enums import ArticleType
from typing import Optional
from bson import ObjectId

class LabeledDataSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    tag: str
    className: str
    depth: int
    textLength: int
    hasImg: bool
    label: str
    source: ArticleType

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }