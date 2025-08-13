import json
import requests
from bs4 import BeautifulSoup
from ..base import BaseCrawler
from config.constants import DEFAULT_HEADERS, VNEXPRESS_COMMENT_API_URL, VNEXPRESS_LISTING_URL
from urllib.parse import urlparse


class VnExpressCrawler(BaseCrawler):
    # Main
    def get_article_html(self, url: str):
        res = requests.get(url, timeout=10, headers=DEFAULT_HEADERS)
        html = res.text

        return html
    # Main
    def get_article_comments(self, html):
        comment_info = self.extract_comment_info_from_html(html)
        if comment_info:
            comment_data = self.get_comments(
                comment_info["article_id"],
                comment_info["site_id"],
                comment_info["objecttype"]
            )
            if comment_data and "data" in comment_data:
                return comment_data["data"]
            else:
                print("⚠️ API trả về không có comment.")
        else:
            print("⚠️ Không tìm thấy article_id trong HTML")
            
    def get_article_urls_and_covered_imgs(self):
        html = requests.get(VNEXPRESS_LISTING_URL, timeout=10).text
        soup = BeautifulSoup(html, "lxml")

        articles = []

        for div in soup.find_all("div", class_="thumb-art"):
            a_tag = div.find("a", href=True)
            img_tag = div.find("img", src=True)

            if not a_tag or not img_tag:
                continue

            href = a_tag["href"]
            img_url = img_tag.get("data-src") or img_tag.get("src")

            if href.startswith("https://vnexpress.net") and "/video/" not in href and "/photo/" not in href:
                if "#" in href:
                    href = href.split("#")[0]

                articles.append({
                    "url": href.split("?")[0],
                    "imgUrl": img_url
                })

        print(f"✅ Extracted {len(articles)} article links with covered images")
        return articles

    
    def extract_comment_info_from_html(self, html):
        soup = BeautifulSoup(html, "lxml")
        tag = soup.find("div", {"id": "box_comment_vne"})
        if not tag:
            return None

        raw = tag.get("data-component-input") # Get attribute data-component-input from div
        if not raw:
            return None

        try:
            data = json.loads(raw)
            return {
                "article_id": data.get("article_id"),
                "site_id": data.get("site_id", "1000000"),
                "objecttype": data.get("objecttype", "1")
            }
        except Exception as e:
            print("⚠️ Lỗi khi phân tích data-component-input:", e)
            return None

    def get_comments(self, article_id, site_id, object_type, offset=0, limit=100):
        params = {
            "offset": offset,
            "limit": limit,
            "objectid": article_id,
            "siteid": site_id,
            "objecttype": object_type
        }
        res = requests.get(VNEXPRESS_COMMENT_API_URL, params=params, headers=DEFAULT_HEADERS)
        return res.json() if res.status_code == 200 else None
    
    def extract_slug_from_url(self, url: str) -> str:
        path = urlparse(url).path
        slug_with_ext = path.strip("/").split("/")[-1]
        return slug_with_ext.removesuffix(".html")
    
    def save_article_content_as_html(self, html, filename):
        with open(filename, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Saved {filename}")
    
    def save_article_comments_as_json(self, html, filename):
        comment = self.get_article_comments(html)
        if comment:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(comment, f, ensure_ascii=False, indent=2)
            print(f"💬 Saved comments to {filename}")
        else:
            print("⚠️ Không có comment để lưu.")
