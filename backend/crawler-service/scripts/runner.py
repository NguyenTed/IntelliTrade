# Crawling initial data

from pipelines.crawl_articles import crawl_urls_and_covered_imgs, crawl_raw_articles
from pipelines.extract_features import FeatureExtractor
from db.mongo import db
from config.tradingview.article_labels import article_label_rules as tradingview_article_label_rules
from config.vnexpress.article_labels import article_label_rules as vnexpress_article_label_rules
from db.models.article_label_model import insert_article_labels
from db.models.article_model import find_all_articles
from app.schemas.article_label_schema import ArticleLabelSchema
from enums.ArticleType import ArticleType
from sources.predict_manager import PredictManager

article_label_rules = tradingview_article_label_rules + vnexpress_article_label_rules

url_collection = db["urls"]
article_collection = db["articles"]

# Pipelines
def fetch_url_and_covered_imgs_to_db():
    crawl_urls_and_covered_imgs()

# Pipelines
def fetch_raw_articles_to_db():
    crawl_raw_articles()

def fetch_article_labels_to_db():
    article_labels = []
    for rule in article_label_rules:
        selector = rule["selector"]
        label = rule["label"]
        source = rule["source"]
        article_label = ArticleLabelSchema(selector=selector, label=label, source=source)
        article_labels.append(article_label)

    insert_article_labels(article_labels)

def extract_labeled_data_to_db():
    extractor = FeatureExtractor()
    extractor.extract_all_labels_to_db()

def save_predicted_articles():
    predict_manager = PredictManager()
    predict_manager.save_all_predicted_articles_to_db()
            

if __name__ == "__main__":
    fetch_url_and_covered_imgs_to_db()
    fetch_raw_articles_to_db()
    fetch_article_labels_to_db()
    extract_labeled_data_to_db()
    save_predicted_articles()