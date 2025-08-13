from db.mongo import db
from typing import List
from app.schemas.url_schema import UrlSchema

collection = db["urls"]

def insert_urls(urls: List[UrlSchema]):
    for url in urls:
        data = url.model_dump(by_alias=True)
        # Tránh update bị duplicate _id = Null
        data.pop("_id") 
        link = data["link"]

        collection.update_one(
            {"link": link},
            {"$set": data},
            upsert=True
        )
    
def find_all_urls() -> List[UrlSchema]:
    cursor = db["urls"].find()
    return [UrlSchema(**doc) for doc in cursor]
