from db.mongo import db
from app.schemas.predicted_article_schema import PredictedArticleSchema
from bson import ObjectId

collection = db["predicted_articles"]

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
