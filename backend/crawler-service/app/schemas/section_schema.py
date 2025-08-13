from pydantic import BaseModel
from enums.ArticleType import ArticleType

class SectionSchema(BaseModel):
    name: str
    source: ArticleType