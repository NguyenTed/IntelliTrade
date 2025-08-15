from pydantic import BaseModel
from typing import List

class SymbolResponse(BaseModel):
    id: str
    name: str
    source: str
    symbolImgs: List[str] = []
    
