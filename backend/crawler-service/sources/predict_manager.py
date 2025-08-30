import os, json
from typing import List
from sources.base import BasePredictor
from sources.vnexpress.vnexpress_predictor import VnExpressPredictor
from sources.tradingview.tradingview_predictor import TradingViewPredictor
from config.constants import PREDICT_FILE
from sources.vnexpress.vnexpress_crawler import VnExpressCrawler
from sources.tradingview.tradingview_crawler import TradingViewCrawler
from enums.ArticleType import ArticleType
from app.schemas.idea_schema import IdeaSchema
from app.schemas.news_chema import NewsSchema
from app.schemas.predicted_article_schema import PredictedArticleSchema
from db.models.idea_model import find_all_ideas, update_predicted_idea
from db.models.news_model import find_all_news, update_predicted_news
from db.models.predicted_article_model import insert_predicted_article

class PredictManager():
    def get_predictor(self, source: ArticleType):
        if source == ArticleType.VNEXPRESS.value:
            return VnExpressPredictor()
        elif source == ArticleType.TRADINGVIEW.value:
            return TradingViewPredictor()
        raise ValueError("Unknown source")

    def save_all_predicted_articles_to_db(self):
        ideas: List[IdeaSchema] = find_all_ideas()
        news: List[NewsSchema] = find_all_news()
        predictor = BasePredictor()

        for idea in ideas:
            # if idea.source == ArticleType.VNEXPRESS.value:
            #     predictor = self.get_predictor(ArticleType.VNEXPRESS)
            # elif idea.source == ArticleType.TRADINGVIEW.value:
            predictor = self.get_predictor(ArticleType.TRADINGVIEW)

            predicted_idea: PredictedArticleSchema  = predictor.predict_idea(idea.id)
            if predicted_idea is None:
                continue
            predicted_id = insert_predicted_article(predicted_idea)
            
            update_predicted_idea(idea.id, predicted_id)

        for new_item in news:
            predictor = self.get_predictor(ArticleType.TRADINGVIEW)

            predicted_news: PredictedArticleSchema  = predictor.predict_news(new_item.id)
            if predicted_news is None:
                continue
            predicted_id = insert_predicted_article(predicted_news)

            update_predicted_news(new_item.id, predicted_id)




    def load_all_predicted_ideas() -> List[dict]:
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