from db.mongo import db
from app.schemas.predicted_article_schema import PredictedArticleSchema
from bson import ObjectId
from typing import List


collection = db["predicted_news"]