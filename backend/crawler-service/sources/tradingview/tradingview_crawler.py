import requests
import os
import json
from ..base import BaseCrawler
from bs4 import BeautifulSoup
from config.constants import TRADINGVIEW_BASE_URL, TRADINGVIEW_IDEAS_URL, DEFAULT_HEADERS, TRADINGVIEW_DIR, TRADINGVIEW_NEWS_URL
from urllib.parse import urlparse
from enums.ArticleCategory import ArticleCategory

GET_PAGE = 2

class TradingViewCrawler(BaseCrawler):
    # Main
    def get_idea_html(self, url: str):
        res = requests.get(url, timeout=10, headers=DEFAULT_HEADERS)
        html = res.text

        return html
    

    def get_idea_urls_and_covered_imgs(self):
        ideas = []
        seen_links = set()

        for i in range(1, GET_PAGE + 1):
            url = TRADINGVIEW_IDEAS_URL if i == 1 else f"{TRADINGVIEW_IDEAS_URL}/page-{i}"
            try:
                html = requests.get(url, timeout=10).text
                soup = BeautifulSoup(html, "lxml")
                main = soup.find("main")

                for idea in main.find_all("article"):
                    # Tìm thẻ a đầu tiên có href tới bài viết
                    link_tag = idea.find("a", href=True)
                    if not link_tag:
                        continue

                    href = link_tag["href"]
                    full_link = href.split("#")[0].split("?")[0]
                    if "/video/" in href or "/photo/" in href:
                        continue

                    seen_links.add(full_link)

                    # Tìm hình ảnh trong idea
                    picture_img = idea.select_one("picture img")
                    img_url = picture_img["src"] if picture_img and picture_img.has_attr("src") else ""
                    ideas.append({
                        "url": full_link,
                        "imgUrl": img_url
                    })

                print(f"✅ Page {i}: Extracted {len(ideas)} idea links with images")

            except Exception as e:
                print(f"❌ Error at page {i}: {e}")

        return ideas
    
    def get_new_urls(self):
        news = []
        seen_links = set()

        url = TRADINGVIEW_NEWS_URL
        try:
            html = requests.get(url, timeout=10).text
            soup = BeautifulSoup(html, "lxml")
            main = soup.find("main")

            for a_tag in main.find_all("a", href=True, class_=lambda c: c and c.startswith("card-")):
                href = a_tag["href"]

                if not href.startswith("/news/"):
                    continue
                if "/video/" in href or "/photo/" in href:
                    continue

                # Tạo link đầy đủ
                full_link = TRADINGVIEW_BASE_URL + href.split("#")[0].split("?")[0]

                if full_link in seen_links:
                    continue
                seen_links.add(full_link)

                news.append({
                    "url": full_link,
                })

                print(f"✅ Extracted news: {full_link}")

        except Exception as e:
            print(f"❌ Error at news extraction: {e}")

        return news


    def extract_slug_from_url(self, url: str, category: ArticleCategory) -> str:
        path = urlparse(url).path
        parts = path.strip("/").split("/")

        if category == ArticleCategory.IDEA:
            return parts[2]  # ví dụ: https://www.tradingview.com/chart/EURUSD/bfZXFnBv-abc/ => bfZXFnBv-abc
        elif category == ArticleCategory.NEWS:
            return parts[1]  # ví dụ: https://www.tradingview.com/news/DJN_DN20250820007468:0-encore-energy-shares-drop-after-upsized-bond-offering-prices/ => DJN_DN20250820007468:0-encore-energy-shares-drop-after-upsized-bond-offering-prices/


    def save_idea_content_as_html(self, url: str):
        html = self.get_idea_html(url)
        slug = self.extract_slug_from_url(url)
        filename = os.path.join(TRADINGVIEW_DIR, f"{slug}.html")

        with open(filename, "w", encoding="utf-8") as f:
            f.write(html)

        print(f"✅ Saved HTML to {filename}")



    def extract_idea_id(self, url: str) -> str:
        path = urlparse(url).path.strip("/").split("/")
        slug = path[2] if len(path) >= 3 else ""
        return slug.split("-")[0]
    
    def get_idea_comments(self, url: str) -> dict:
        idea_id = self.extract_idea_id(url)
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
    
    def save_idea_comments_as_json(self, url: str, filename):
        comments_json = self.get_idea_comments(url)

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(comments_json, f, ensure_ascii=False, indent=2)

    
if __name__ == "__main__":
    crawler = TradingViewCrawler()
    urls = crawler.get_idea_urls()
    for url in urls:
        slug = crawler.extract_slug_from_url(url)

        comment_path = os.path.join(TRADINGVIEW_DIR, f"{slug}.json")
        
        crawler.save_idea_comments_as_json(url, comment_path)