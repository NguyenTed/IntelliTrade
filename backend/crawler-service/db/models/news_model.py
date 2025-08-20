from bson import ObjectId
from db.mongo import db
from app.schemas.news_chema import NewsSchema
from typing import List, Optional
from enums.ArticleType import ArticleType
from app.requests.page_request import PageRequest


collection = db["news"]

def insert_news(news: List[NewsSchema]):
    for new in news:
        data = new.model_dump(by_alias=True)
        data.pop("_id") 
        slug = data["slug"]

        collection.update_one(
            {"slug": slug},       
            {"$set": data},     
            upsert=True           
        )

def find_all_news() -> List[NewsSchema]:
    cursor = collection.find()
    return [NewsSchema(**doc) for doc in cursor]

def find_news_by_id(id: ObjectId) -> NewsSchema:
    cursor = collection.find_one({"_id": id})
    return NewsSchema(**cursor)

def update_predicted_news(new_id: ObjectId, predicted_id: ObjectId):
    result = collection.update_one(
        {"_id": new_id}, 
        {"$set": {"predicted": predicted_id}}
    )
    return result.modified_count

def find_tradingview_news(page_request: PageRequest) -> List[NewsSchema]:
    skip = (page_request.page - 1) * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1
    
    cursor = (
        collection.find({"source": ArticleType.TRADINGVIEW.value})
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(page_request.size)
        )
    return [NewsSchema(**doc) for doc in cursor]

def count_news() -> int:
    return collection.count_documents({})

def find_news_by_slug(slug: str) -> Optional[NewsSchema]:
    cursor = collection.find_one({"slug": slug})
    return NewsSchema(**cursor) if cursor else None
