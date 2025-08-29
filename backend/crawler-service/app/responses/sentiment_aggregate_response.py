from pydantic import BaseModel
from app.schemas.symbol_schema import SymbolSchema

class SentimentAggregateResponse(BaseModel):
    symbol: SymbolSchema
    label: str
    score: float
    count: int

