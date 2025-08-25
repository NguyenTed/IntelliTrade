from typing import List
from sources.vnexpress.vnexpress_crawler import VnExpressCrawler
from sources.tradingview.tradingview_crawler import TradingViewCrawler
from config.constants import VNEXPRESS_BASE_URL, TRADINGVIEW_BASE_URL
from app.schemas.url_schema import UrlSchema
from app.schemas.idea_schema import IdeaSchema
from app.schemas.news_chema import NewsSchema
from app.schemas.covered_image_schema import CoveredImageSchema
from enums.ArticleType import ArticleType
from enums.ArticleCategory import ArticleCategory
from db.models.url_model import insert_urls, find_all_urls
from db.models.idea_model import insert_ideas
from db.models.news_model import insert_news
from db.models.covered_image_model import insert_covered_images, find_img_by_url

vnexpress_source = VnExpressCrawler()
tradingview_source = TradingViewCrawler()

def crawl_urls_and_covered_imgs():
    # [{"url": ..., "imgUrl": ...}]
    # articles = vnexpress_source.get_article_urls_and_covered_imgs()
    # articles.extend(tradingview_source.get_article_urls_and_covered_imgs())
    ideas = tradingview_source.get_idea_urls_and_covered_imgs()
    news = tradingview_source.get_new_urls()

    covered_images = []
    for idea in ideas:
        img_url = idea.get("imgUrl")
        url = idea.get("url")
        if img_url:
            covered_images.append(CoveredImageSchema(imgUrl=img_url, url=url))

    # Lưu covered images vào db
    if covered_images:
        insert_covered_images(covered_images)
    else:
        print("⚠️ No covered images found.")

    # Lưu URLs vào db
    all_ideas_urls = [idea["url"] for idea in ideas]
    all_news_urls = [new["url"] for new in news]

    url_ideas_schemas = [UrlSchema(link=url) for url in all_ideas_urls]
    insert_urls(url_ideas_schemas, ArticleCategory.IDEA)

    url_news_schemas = [UrlSchema(link=url) for url in all_news_urls]
    insert_urls(url_news_schemas, ArticleCategory.NEWS)


# crawl_ideas()
def crawl_raw_ideas():
    urls = find_all_urls(ArticleCategory.IDEA)
    ideas: List[IdeaSchema] = []

    for url_obj in urls:
        url = url_obj.link
        imgUrl = None

        coveredImg: CoveredImageSchema = find_img_by_url(url)
        if coveredImg:
            imgUrl = coveredImg.imgUrl

        if VNEXPRESS_BASE_URL in url:
            source = ArticleType.VNEXPRESS.value
            slug = vnexpress_source.extract_slug_from_url(url)
            html = vnexpress_source.get_article_html(url)
            raw_comment = vnexpress_source.get_article_comments(html)
        elif TRADINGVIEW_BASE_URL in url:
            source = ArticleType.TRADINGVIEW.value
            slug = tradingview_source.extract_slug_from_url(url, ArticleCategory.IDEA)
            html = tradingview_source.get_idea_html(url)
            raw_comment = tradingview_source.get_idea_comments(url)
        else: 
            continue

        idea = IdeaSchema(
            html=html,
            raw_comment=raw_comment,
            slug=slug,
            source=source,
            url=url,
            imgUrl=imgUrl
        )

        ideas.append(idea)
    
    insert_ideas(ideas)

# crawl news
def crawl_raw_news():
    urls = find_all_urls(ArticleCategory.NEWS)
    news_list: List[NewsSchema] = []

    for url_obj in urls:
        url = url_obj.link

        source = ArticleType.TRADINGVIEW.value
        slug = tradingview_source.extract_slug_from_url(url, ArticleCategory.NEWS)
        html = tradingview_source.get_idea_html(url)

        new = NewsSchema(
            html=html,
            slug=slug,
            source=source,
            url=url,
        )

        news_list.append(new)
    
    insert_news(news_list)


