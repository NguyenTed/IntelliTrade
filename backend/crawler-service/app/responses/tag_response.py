from pydantic import BaseModel

class TagResponse(BaseModel):
    id: str
    name: str
    source: str
    
