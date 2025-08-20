from db.mongo import db
from typing import List
from app.schemas.url_schema import UrlSchema
from enums.ArticleCategory import ArticleCategory

news_collection = db["news_urls"]
ideas_collection = db["idea_urls"]

def insert_urls(urls: List[UrlSchema], category: ArticleCategory):
    for url in urls:
        data = url.model_dump(by_alias=True)
        # Tránh update bị duplicate _id = Null
        data.pop("_id") 
        link = data["link"]

        if category == ArticleCategory.IDEA:
            ideas_collection.update_one(
                {"link": link},
                {"$set": data},
                upsert=True
            )
        elif category == ArticleCategory.NEWS:
            news_collection.update_one(
                {"link": link},
                {"$set": data},
                upsert=True
            )

    
def find_all_urls(category: ArticleCategory) -> List[UrlSchema]:
    if category == ArticleCategory.IDEA:
        cursor = ideas_collection.find()
    elif category == ArticleCategory.NEWS:
        cursor = news_collection.find()
    else:
        return []

    return [UrlSchema(**doc) for doc in cursor]

