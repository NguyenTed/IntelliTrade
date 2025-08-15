from db.mongo import db
from app.schemas.tag_schema import TagSchema
from typing import List

collection = db["tags"]

def insert_tag(tag: TagSchema):
    data = tag.model_dump(by_alias=True)
    data.pop("_id")
    
    name = data["name"]

    collection.update_one(
        {"name": name},
        {"$set": data},
        upsert=True
    )

def find_tag_by_keyword(keyword: str) -> List[TagSchema]:
    cursor = collection.find({"name": {"$regex": keyword, "$options": "i"}})
    return [TagSchema(**doc) for doc in cursor]