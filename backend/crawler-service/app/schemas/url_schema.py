from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class UrlSchema(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    link: str

    model_config = {
        # "populate_by_name": True, 
        "arbitrary_types_allowed": True
    }