from flask import Flask, jsonify, Blueprint
from app.services.crawl_article_service import CrawlArticleService
from app.responses.predicted_article_response import PredictedArticleResponse
from app.requests.page_request import PageRequest
from enums.ArticleCategory import ArticleCategory

crawler_bp = Blueprint("crawler", __name__)

@crawler_bp.route("/crawler/vnexpress/ideas", methods=["GET"])
def get_express_predicted_ideas():
    page_request = PageRequest.from_flask()
    page_response = CrawlArticleService.get_vnexpress_page(page_request)
    return jsonify(page_response.model_dump())

@crawler_bp.route("/crawler/tradingview/ideas", methods=["GET"])
def get_tradingview_ideas():
    page_request = PageRequest.from_flask()
    page_response = CrawlArticleService.get_tradingview_page(page_request, ArticleCategory.IDEA)
    return jsonify(page_response.model_dump(mode="json"))

@crawler_bp.route("/crawler/tradingview/news", methods=["GET"])
def get_tradingview_news():
    page_request = PageRequest.from_flask()
    page_response = CrawlArticleService.get_tradingview_page(page_request, ArticleCategory.NEWS)
    return jsonify(page_response.model_dump(mode="json"))

# @crawler_bp.route("/crawler/<string:tag_id>", methods=["GET"])
# def get_articles_by_tag(tag_id: str):
#     page_request = PageRequest.from_flask()
#     page_response = CrawlArticleService.get_articles_by_tag(page_request, tag_id)
#     return jsonify(page_response.model_dump())

@crawler_bp.route("/crawler/ideas/<string:slug>", methods=["GET"])
def get_ideas_by_slug(slug: str):
    page_response = CrawlArticleService.get_ideas_by_slug(slug)
    return jsonify(page_response.model_dump(mode="json"))

@crawler_bp.route("/crawler/news/<string:slug>", methods=["GET"])
def get_news_by_slug(slug: str):
    page_response = CrawlArticleService.get_news_by_slug(slug)
    return jsonify(page_response.model_dump(mode="json"))