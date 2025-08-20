from bson import ObjectId
from db.mongo import db
from typing import List
from app.schemas.idea_schema import IdeaSchema
from app.schemas.predicted_article_schema import PredictedArticleSchema
from enums.ArticleType import ArticleType
from app.requests.page_request import PageRequest
from typing import Optional

collection = db["ideas"]

def insert_ideas(ideas: List[IdeaSchema]):
    for idea in ideas:
        data = idea.model_dump(by_alias=True)
        data.pop("_id") 
        slug = data["slug"]

        collection.update_one(
            {"slug": slug},       
            {"$set": data},     
            upsert=True           
        )

def find_all_ideas() -> List[IdeaSchema]:
    cursor = collection.find()
    return [IdeaSchema(**doc) for doc in cursor]

def find_vnexpress_ideas(page_request: PageRequest) -> List[IdeaSchema]:
    skip = page_request.page * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1

    cursor = (
        collection.find({"source": ArticleType.TRADINGVIEW.value})
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(page_request.size)
        )
    return [IdeaSchema(**doc) for doc in cursor]

def find_tradingview_ideas(page_request: PageRequest) -> List[IdeaSchema]:
    skip = (page_request.page - 1) * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1
    
    cursor = (
        collection.find({"source": ArticleType.TRADINGVIEW.value})
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(page_request.size)
        )
    return [IdeaSchema(**doc) for doc in cursor]

def find_idea_by_id(id: ObjectId) -> IdeaSchema:
    cursor = collection.find_one({"_id": id})
    return IdeaSchema(**cursor)

def find_idea_by_url(url: str) -> IdeaSchema:
    cursor = collection.find_one({"url": url})
    return IdeaSchema(**cursor)

def update_predicted_idea(idea_id: ObjectId, predicted_id: ObjectId):
    result = collection.update_one(
        {"_id": idea_id}, 
        {"$set": {"predicted": predicted_id}}
    )
    return result.modified_count

def find_vnexpress_predicted_ideas(page_request: PageRequest) -> list[PredictedArticleSchema]:
    skip = (page_request.page - 1) * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1

    pipeline = [
    {
        "$match": {
            "source": ArticleType.VNEXPRESS.value,
            "predicted": {"$type": "objectId"}
        }
    },
    {
        "$lookup": {
            "from": "predicted_ideas",
            "localField": "predicted",
            "foreignField": "_id",
            "as": "predicted_info"
        }
    },
    {"$unwind": "$predicted_info"},

    {"$replaceRoot": {"newRoot": "$predicted_info"}},
    {"$sort": {sort_field: sort_order}},
    {"$skip": skip},
    {"$limit": page_request.size}
]

    docs = collection.aggregate(pipeline)
    return [PredictedArticleSchema(**doc) for doc in docs]




def find_tradingview_predicted_ideas(page_request: PageRequest) -> list[PredictedArticleSchema]:
    skip = (page_request.page - 1) * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1

    pipeline = [
        {
            "$match": {
                "source": ArticleType.TRADINGVIEW.value,
                "predicted": {"$type": "objectId"}
            }
        },
        {
            "$lookup": {
                "from": "predicted_ideas",
                "localField": "predicted",
                "foreignField": "_id",
                "as": "predicted_info"
            }
        },
        {"$unwind": "$predicted_info"},

        {"$replaceRoot": {"newRoot": "$predicted_info"}},
        {"$sort": {sort_field: sort_order}},
        {"$skip": skip},
        {"$limit": page_request.size}
    ]

    docs = collection.aggregate(pipeline)
    return [PredictedArticleSchema(**doc) for doc in docs]

def count_ideas_base_on_type(type: ArticleType) -> int:
    return collection.count_documents({
        "source": type,
        "predicted": {"$type": "objectId"}
    })

def find_idea_by_slug(slug: str) -> Optional[IdeaSchema]:
    cursor = collection.find_one({"slug": slug})
    return IdeaSchema(**cursor) if cursor else None
