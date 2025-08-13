from pydantic import BaseModel

class SymbolResponse(BaseModel):
    id: str
    name: str
    source: str
    
