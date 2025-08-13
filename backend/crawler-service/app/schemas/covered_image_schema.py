from pydantic import BaseModel, Field
from bson import ObjectId
from typing import Optional

class CoveredImageSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    imgUrl: str
    url: str

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }