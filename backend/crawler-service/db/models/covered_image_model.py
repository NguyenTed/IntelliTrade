from db.mongo import db
from typing import Optional
from app.schemas.covered_image_schema import CoveredImageSchema

collection = db["covered_images"]

def insert_covered_images(imgs: list[CoveredImageSchema]):
    for img in imgs:
        data = img.model_dump(by_alias=True)
        data.pop("_id")
        url = img.url

        collection.update_one(
            {"url": url}, 
            {"$set": data},
            upsert=True
        )

def find_img_by_url(url: str) -> Optional[CoveredImageSchema]:
    cursor = db["covered_images"].find_one({"url": url})
    if cursor:
        return CoveredImageSchema(**cursor)
    return None 

