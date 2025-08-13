import requests
import os
import json
from ..base import BaseCrawler
from bs4 import BeautifulSoup
from config.constants import TRADINGVIEW_BASE_URL, TRADINGVIEW_IDEAS_URL, DEFAULT_HEADERS, TRADINGVIEW_DIR
from urllib.parse import urlparse

GET_PAGE = 2

class TradingViewCrawler(BaseCrawler):
    # Main
    def get_article_html(self, url: str):
        res = requests.get(url, timeout=10, headers=DEFAULT_HEADERS)
        html = res.text

        return html
    

    def get_article_urls_and_covered_imgs(self):
        articles = []
        seen_links = set()

        for i in range(1, GET_PAGE + 1):
            url = TRADINGVIEW_IDEAS_URL if i == 1 else f"{TRADINGVIEW_IDEAS_URL}/page-{i}"
            try:
                html = requests.get(url, timeout=10).text
                soup = BeautifulSoup(html, "lxml")
                main = soup.find("main")

                for article in main.find_all("article"):
                    # Tìm thẻ a đầu tiên có href tới bài viết
                    link_tag = article.find("a", href=True)
                    if not link_tag:
                        continue

                    href = link_tag["href"]
                    full_link = href.split("#")[0].split("?")[0]
                    # Bỏ qua link không phải bài viết
                    if "/video/" in href or "/photo/" in href:
                        continue

                    seen_links.add(full_link)

                    # Tìm hình ảnh trong article
                    picture_img = article.select_one("picture img")
                    img_url = picture_img["src"] if picture_img and picture_img.has_attr("src") else ""
                    articles.append({
                        "url": full_link,
                        "imgUrl": img_url
                    })

                print(f"✅ Page {i}: Extracted {len(articles)} article links with images")

            except Exception as e:
                print(f"❌ Error at page {i}: {e}")

        return articles


    def extract_slug_from_url(self, url: str) -> str:
        path = urlparse(url).path
        parts = path.strip("/").split("/")
    
        return (parts[1] + "_" + parts[2]) # ví dụ: https://www.tradingview.com/chart/EURUSD/bfZXFnBv-abc/ => EURUSD_bfZXFnBv-abc
 

    def save_article_content_as_html(self, url: str):
        html = self.get_article_html(url)
        slug = self.extract_slug_from_url(url)
        filename = os.path.join(TRADINGVIEW_DIR, f"{slug}.html")

        with open(filename, "w", encoding="utf-8") as f:
            f.write(html)

        print(f"✅ Saved HTML to {filename}")



    def extract_article_id(self, url: str) -> str:
        path = urlparse(url).path.strip("/").split("/")
        slug = path[2] if len(path) >= 3 else ""
        return slug.split("-")[0]
    
    def get_article_comments(self, url: str) -> dict:
        idea_id = self.extract_article_id(url)
        api_url = f"https://www.tradingview.com/api/v1/ideas/{idea_id}/comments/tree/"
        params = {
            "offset": 0,
            "sort_by_rating": "true"
        }
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": url
        }

        res = requests.get(api_url, headers=headers, params=params)
        return res.json() 
    
    def save_article_comments_as_json(self, url: str, filename):
        comments_json = self.get_article_comments(url)

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(comments_json, f, ensure_ascii=False, indent=2)

    
if __name__ == "__main__":
    crawler = TradingViewCrawler()
    urls = crawler.get_article_urls()
    for url in urls:
        slug = crawler.extract_slug_from_url(url)

        comment_path = os.path.join(TRADINGVIEW_DIR, f"{slug}.json")
        
        crawler.save_article_comments_as_json(url, comment_path)