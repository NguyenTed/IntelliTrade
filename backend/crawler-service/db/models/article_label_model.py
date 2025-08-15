from db.mongo import db
from typing import List
from app.schemas.article_label_schema import ArticleLabelSchema

collection = db["article_labels"]

def insert_article_labels(article_labels: List[ArticleLabelSchema]):
    for label in article_labels:
        data = label.model_dump(by_alias=True)
        data.pop("_id")
        
        collection.insert_one(data)

def find_all_article_labels() -> List[ArticleLabelSchema]:
    cursor = db["article_labels"].find()
    return [ArticleLabelSchema(**doc) for doc in cursor]