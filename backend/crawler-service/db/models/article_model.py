from bson import ObjectId
from db.mongo import db
from typing import List
from app.schemas.article_schema import ArticleSchema
from app.schemas.predicted_article_schema import PredictedArticleSchema
from enums.ArticleType import ArticleType
from app.requests.page_request import PageRequest
from typing import Optional

collection = db["articles"]

def insert_articles(articles: List[ArticleSchema]):
    for article in articles:
        data = article.model_dump(by_alias=True)
        data.pop("_id") 
        slug = data["slug"]

        collection.update_one(
            {"slug": slug},       
            {"$set": data},     
            upsert=True           
        )

def find_all_articles() -> List[ArticleSchema]:
    cursor = collection.find()
    return [ArticleSchema(**doc) for doc in cursor]

def find_vnexpress_articles(page_request: PageRequest) -> List[ArticleSchema]:
    skip = page_request.page * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1

    cursor = (
        collection.find({"source": ArticleType.TRADINGVIEW.value})
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(page_request.size)
        )
    return [ArticleSchema(**doc) for doc in cursor]

def find_tradingview_articles(page_request: PageRequest) -> List[ArticleSchema]:
    skip = (page_request.page - 1) * page_request.size
    sort_field = page_request.sortBy
    sort_order = 1 if page_request.sortDirection == "asc" else -1
    
    cursor = (
        collection.find({"source": ArticleType.TRADINGVIEW.value})
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(page_request.size)
        )
    return [ArticleSchema(**doc) for doc in cursor]

def find_article_by_id(id: ObjectId) -> ArticleSchema:
    cursor = collection.find_one({"_id": id})
    return ArticleSchema(**cursor)

def find_article_by_url(url: str) -> ArticleSchema:
    cursor = collection.find_one({"url": url})
    return ArticleSchema(**cursor)

def update_predicted_article(article_id: ObjectId, predicted_id: ObjectId):
    result = collection.update_one(
        {"_id": article_id}, 
        {"$set": {"predicted": predicted_id}}
    )
    return result.modified_count

def find_vnexpress_predicted_articles(page_request: PageRequest) -> list[PredictedArticleSchema]:
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
            "from": "predicted_articles",
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




def find_tradingview_predicted_articles(page_request: PageRequest) -> list[PredictedArticleSchema]:
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
                "from": "predicted_articles",
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

def count_articles_base_on_type(type: ArticleType) -> int:
    return collection.count_documents({
        "source": type,
        "predicted": {"$type": "objectId"}
    })

def find_article_by_slug(slug: str) -> Optional[ArticleSchema]:
    cursor = collection.find_one({"slug": slug})
    return ArticleSchema(**cursor) if cursor else None
