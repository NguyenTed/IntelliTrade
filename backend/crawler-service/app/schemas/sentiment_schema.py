from pydantic import BaseModel
from typing import Literal

class SentimentSchema(BaseModel):
    label: Literal["POSITIVE", "NEGATIVE", "NEUTRAL"]
    score: float
