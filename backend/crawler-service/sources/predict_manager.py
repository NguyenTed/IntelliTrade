import os, json
from typing import List
from sources.base import BasePredictor
from sources.vnexpress.vnexpress_predictor import VnExpressPredictor
from sources.tradingview.tradingview_predictor import TradingViewPredictor
from config.constants import PREDICT_FILE
from sources.vnexpress.vnexpress_crawler import VnExpressCrawler
from sources.tradingview.tradingview_crawler import TradingViewCrawler
from enums.ArticleType import ArticleType
from app.schemas.article_schema import ArticleSchema
from app.schemas.predicted_article_schema import PredictedArticleSchema
from db.models.article_model import find_all_articles, update_predicted_article
from db.models.predicted_article_model import insert_predicted_article

class PredictManager():
    def get_predictor(self, source: ArticleType):
        if source == ArticleType.VNEXPRESS.value:
            return VnExpressPredictor()
        elif source == ArticleType.TRADINGVIEW.value:
            return TradingViewPredictor()
        raise ValueError("Unknown source")

    def save_all_predicted_articles_to_db(self):
        articles: List[ArticleSchema] = find_all_articles()
        predictor = BasePredictor()

        for article in articles:
            if article.source == ArticleType.VNEXPRESS.value:
                predictor = self.get_predictor(ArticleType.VNEXPRESS)
            elif article.source == ArticleType.TRADINGVIEW.value:
                predictor = self.get_predictor(ArticleType.TRADINGVIEW)

            predicted_article: PredictedArticleSchema  = predictor.predict(article.id)

            predicted_id = insert_predicted_article(predicted_article)
            
            update_predicted_article(article.id, predicted_id)




    def load_all_predicted_articles() -> List[dict]:
        if not os.path.exists(PREDICT_FILE):
            return []

        with open(PREDICT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

# if __name__ == "__main__":
#     crawler = TradingViewCrawler()
#     urls = crawler.get_article_urls()
#     slugs = []
#     for url in urls:
#         slugs.append(crawler.extract_slug_from_url(url))
#     predictManager = PredictManager()
#     predictManager.save_all_predicted_articles(ArticleType.TRADINGVIEW.value, slugs)