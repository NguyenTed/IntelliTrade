from typing import List
from sources.vnexpress.vnexpress_crawler import VnExpressCrawler
from sources.tradingview.tradingview_crawler import TradingViewCrawler
from config.constants import VNEXPRESS_BASE_URL, TRADINGVIEW_BASE_URL
from app.schemas.url_schema import UrlSchema
from app.schemas.article_schema import ArticleSchema
from app.schemas.covered_image_schema import CoveredImageSchema
from enums.ArticleType import ArticleType
from db.models.url_model import insert_urls, find_all_urls
from db.models.article_model import insert_articles
from db.models.covered_image_model import insert_covered_images, find_img_by_url

vnexpress_source = VnExpressCrawler()
tradingview_source = TradingViewCrawler()

def crawl_urls_and_covered_imgs():
    # [{"url": ..., "imgUrl": ...}]
    articles = vnexpress_source.get_article_urls_and_covered_imgs()
    articles.extend(tradingview_source.get_article_urls_and_covered_imgs())
    
    covered_images = []
    for article in articles:
        img_url = article.get("imgUrl")
        url = article.get("url")
        if img_url:
            covered_images.append(CoveredImageSchema(imgUrl=img_url, url=url))

    # Lưu covered images vào db
    if covered_images:
        insert_covered_images(covered_images)
    else:
        print("⚠️ No covered images found.")

    # Lưu URLs vào db
    all_urls = [article["url"] for article in articles]
    url_schemas = [UrlSchema(link=url) for url in all_urls]
    insert_urls(url_schemas)


# crawl_articles()
def crawl_raw_articles():
    urls = find_all_urls()
    articles: List[ArticleSchema] = []

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
            slug = tradingview_source.extract_slug_from_url(url)
            html = tradingview_source.get_article_html(url)
            raw_comment = tradingview_source.get_article_comments(url)
        else: 
            continue

        article = ArticleSchema(
            html=html,
            raw_comment=raw_comment,
            slug=slug,
            source=source,
            url=url,
            imgUrl=imgUrl
        )

        articles.append(article)
    
    insert_articles(articles)


