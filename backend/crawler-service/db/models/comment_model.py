from db.mongo import db
from app.schemas.comment_schema import CommentSchema
from bson import ObjectId
from typing import List

collection = db["comments"]

def insert_comment(comment: CommentSchema) -> ObjectId:
    data = comment.model_dump(by_alias=True)
    data.pop("_id", None) 

    if comment.comment_id is not None:
        result = collection.update_one(
            {"comment_id": comment.comment_id},
            {"$set": data},
            upsert=True
        )
        if result.upserted_id:
            return result.upserted_id
        else:
            doc = collection.find_one({"comment_id": comment.comment_id})
            return doc["_id"] if doc else None
    else:
        inserted = collection.insert_one(data)
        return inserted.inserted_id




def find_comments_by_ids(ids: List[ObjectId]) -> List[CommentSchema]:
    docs = collection.find({"_id": {"$in": ids}})
    return [CommentSchema(**doc) for doc in docs]

def find_one_comment_by_id(id: ObjectId) -> CommentSchema:
    doc = collection.find_one({"_id": id})
    return CommentSchema(**doc) if doc else None
