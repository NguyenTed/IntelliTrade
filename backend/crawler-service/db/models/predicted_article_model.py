from db.mongo import db
from app.schemas.predicted_article_schema import PredictedArticleSchema
from bson import ObjectId
from typing import List
from app.schemas.article_schema import ArticleSchema
from typing import Union


collection = db["predicted_articles"]

def find_predicted_articles_from_articles(articles: List[ArticleSchema]) -> List[PredictedArticleSchema]:
    predicted_ids = [
        article.predicted
        for article in articles
        if article.predicted
    ]

    if not predicted_ids:
        return []

    cursor = collection.find({
        "_id": {"$in": predicted_ids}
    })
    # return _find_with_symbols({"_id": {"$in": predicted_ids}}, many=True)

    return [PredictedArticleSchema(**doc) for doc in cursor]

def find_predicted_article_from_article(article: ArticleSchema) -> PredictedArticleSchema:
    cursor = collection.find_one({"_id": article.predicted})
    return PredictedArticleSchema(**cursor) 


def insert_predicted_article(predicted_article: PredictedArticleSchema) -> ObjectId:
    data = predicted_article.model_dump(by_alias=True)
    data.pop("_id")

    result = collection.insert_one(data)
    return result.inserted_id

def find_predicted_article_by_url(url: str) -> PredictedArticleSchema:
    cursor = collection.find_one({"url": url})
    return PredictedArticleSchema(**cursor)

def add_comment(article_id: str, comment_id: ObjectId):
    print(f"Adding comment {comment_id} to article {article_id}")
    collection.update_one(
            {"_id": ObjectId(article_id)},
            {"$addToSet": {"comments": comment_id}}  # dùng $addToSet tránh trùng
        )
    

# def _find_with_symbols(match_filter: dict, many: bool = False) -> Union[PredictedArticleSchema, List[PredictedArticleSchema]]:
#     pipeline = [
#         {"$match": match_filter},
#         {
#             "$lookup": {
#                 "from": "symbols",
#                 "localField": "symbols",
#                 "foreignField": "_id",
#                 "as": "symbols"
#             }
#         }
#     ]
#     results = list(collection.aggregate(pipeline))

#     if not results:
#         return [] if many else None

#     if many:
#         return [PredictedArticleSchema(**doc) for doc in results]
#     else:
#         return PredictedArticleSchema(**results[0])
    
