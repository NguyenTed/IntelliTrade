from pipelines.crawl_articles import crawl_urls_and_covered_imgs, crawl_raw_ideas, crawl_raw_news
from pipelines.extract_features import FeatureExtractor
from pipelines.predict_sentiments import run_predict_sentiments
from db.mongo import db
from config.tradingview.idea_labels import idea_label_rules as tradingview_idea_label_rules
from config.tradingview.new_labels import new_label_rules as tradingview_new_label_rules
from config.vnexpress.article_labels import article_label_rules as vnexpress_article_label_rules
from db.models.article_label_model import insert_article_labels
from db.models.idea_model import find_all_ideas
from app.schemas.article_label_schema import ArticleLabelSchema
from enums.ArticleType import ArticleType
from sources.predict_manager import PredictManager
from datetime import datetime
from db.mongo import db
from datetime import datetime, timezone
flags_collection = db["system_flags"]

def is_initialized():
    return flags_collection.find_one({"_id": "runner_initialized"}) is not None

def set_initialized():
    flags_collection.insert_one({
        "_id": "runner_initialized",
        "timestamp": datetime.now(timezone.utc)
    })


idea_label_rules = tradingview_idea_label_rules + tradingview_new_label_rules

url_collection = db["urls"]
idea_collection = db["ideas"]

# Pipelines
def fetch_url_and_covered_imgs_to_db():
    crawl_urls_and_covered_imgs()

# Pipelines
def fetch_raw_articles_to_db():
    crawl_raw_ideas()
    crawl_raw_news()


def fetch_article_labels_to_db():
    idea_labels = []
    for rule in idea_label_rules:
        selector = rule["selector"]
        label = rule["label"]
        source = rule["source"]
        idea_label = ArticleLabelSchema(selector=selector, label=label, source=source)
        idea_labels.append(idea_label)

    insert_article_labels(idea_labels)

def extract_labeled_data_to_db():
    extractor = FeatureExtractor()
    extractor.extract_all_labels_to_db()

def save_predicted_articles():
    predict_manager = PredictManager()
    predict_manager.save_all_predicted_articles_to_db()
            

if __name__ == "__main__":
    # if is_initialized():
    #     print("🕒 Skipping runner (already initialized in DB)")
    # else:
        # print("🚀 Running initial crawler...")
        # fetch_url_and_covered_imgs_to_db()
        # fetch_raw_articles_to_db()
        # fetch_article_labels_to_db()
        # extract_labeled_data_to_db()
        # save_predicted_articles()
        run_predict_sentiments()
        # set_initialized()
        # print("✅ Runner init done!")