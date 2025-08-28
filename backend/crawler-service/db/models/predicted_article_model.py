from db.mongo import db
from app.schemas.predicted_article_schema import PredictedArticleSchema
from bson import ObjectId
from typing import List
from app.schemas.idea_schema import IdeaSchema
from typing import Union


collection = db["predicted_articles"]

def find_predicted_articles_from_ids(ids: List[ObjectId]) -> List[PredictedArticleSchema]:
    if not ids:
        return []

    cursor = collection.find({
        "_id": {"$in": ids}
    })

    return [PredictedArticleSchema(**doc) for doc in cursor]

    # if not predicted_ids:
    #     return []

    # cursor = collection.find({
    #     "_id": {"$in": predicted_ids}
    # })
    # # return _find_with_symbols({"_id": {"$in": predicted_ids}}, many=True)

    return [PredictedArticleSchema(**doc) for doc in cursor]

def find_predicted_article_from_id(id: ObjectId) -> PredictedArticleSchema:
    cursor = collection.find_one({"_id": id})
    return PredictedArticleSchema(**cursor) 


def insert_predicted_article(predicted_idea: PredictedArticleSchema) -> ObjectId:
    data = predicted_idea.model_dump(by_alias=True)
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
    

# def _find_with_symbols(match_filter: dict, many: bool = False) -> Union[PredictedIdeaSchema, List[PredictedIdeaSchema]]:
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
#         return [PredictedIdeaSchema(**doc) for doc in results]
#     else:
#         return PredictedIdeaSchema(**results[0])
    
def find_predicted_articles() -> List[PredictedArticleSchema]:
    cursor = collection.find()
    return [PredictedArticleSchema(**doc) for doc in cursor]


def update_sentiment(article_id: ObjectId, sentiment: dict):
    collection.update_one(
        {"_id": article_id},
        {"$set": {"sentiment": sentiment}}
    )