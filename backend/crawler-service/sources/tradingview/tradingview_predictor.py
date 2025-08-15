from sources.base import BasePredictor
from bs4 import BeautifulSoup
import numpy as np
import pandas as pd
from utils.get_tag_depth import get_depth
from utils.html_to_jsx import html_to_jsx
from enums.ArticleType import ArticleType
from app.schemas.predicted_article_schema import PredictedArticleSchema
from app.schemas.article_schema import ArticleSchema
from app.schemas.predicted_article_schema import PredictedArticleSchema
from app.schemas.comment_schema import CommentSchema
from app.schemas.symbol_schema import SymbolSchema
from app.schemas.tag_schema import TagSchema
from db.models.article_model import find_article_by_id
from db.models.symbol_model import insert_symbol
from db.models.tag_model import insert_tag
from db.models.comment_model import insert_comment
from bson import ObjectId

IGNORE_TAGS = {'script', 'style', 'meta', 'link', 'noscript', 'svg'}

class TradingViewPredictor(BasePredictor):

    def predict(self, id: ObjectId) -> PredictedArticleSchema:

        article: ArticleSchema = find_article_by_id(id)

        html = article.html
        result = PredictedArticleSchema(url=article.url)
        soup = BeautifulSoup(html, "lxml")
        tags = soup.find_all(True)
        symbol: SymbolSchema = SymbolSchema(name="", source=ArticleType.TRADINGVIEW.value)

        for tag in tags:
            if tag.name in IGNORE_TAGS:
                continue
            text = tag.get_text(strip=True)
            if not text and tag.name != "img": 
                continue

            tag_name = tag.name
            tag_class = tag.get("class")[0] if tag.get("class") else ""
            depth = get_depth(tag)
            text_len = len(text)
            has_img = bool(tag.find("img"))

            df_input = pd.DataFrame([[tag_name, tag_class, "tradingview"]], columns=["tag", "class", "source"])
            categorical = self.encoder.transform(df_input)
            numeric = np.array([[depth, text_len, has_img]])
            features = np.concatenate([categorical, numeric], axis=1)

            label = self.model.predict(features)[0]
            if label == "title" and not result.title:
                result.title = text
            elif label == "content":
                for child in tag.find_all(string=True, recursive=True):
                    child_text = child.strip()
                    if child_text:
                        result.content.append(child_text)
            elif label == "symbol":
                symbol.name = text
            elif label == "symbolImage":
                src = tag.get("src")
                if not src:
                    continue

                # ✅ Kiểm tra nếu thẻ cha có class bắt đầu bằng 'header-'
                has_header_parent = any(
                    parent for parent in tag.find_parents()
                    if parent.has_attr("class") and any(c.startswith("header-") for c in parent["class"])
                )

                if has_header_parent and src not in symbol.symbolImgs:
                    symbol.symbolImgs.append(src)
            elif label == "tag":
                if text not in result.tags:
                    result.tags.append(text)
                tag = TagSchema(name=text, source=ArticleType.TRADINGVIEW.value)
                insert_tag(tag)
                
            elif label == "tradeSide":
                if tag.get("class") and any(c.startswith("short-") for c in tag["class"]):
                    result.tradeSide = "short"
                elif tag.get("class") and any(c.startswith("long-") for c in tag["class"]):
                    result.tradeSide = "long"
            elif label == "contentHtml":
                try:
                    fragment = str(tag)
                    jsx_string = html_to_jsx(fragment)
                    result.contentHtml = jsx_string
                except Exception:
                    # fallback: lưu nguyên HTML nếu có lỗi convert
                    result.contentHtml = str(tag)

                    id: ObjectId = insert_symbol(symbol)
                    result.symbols.append(id)

        id: ObjectId = insert_symbol(symbol)
        result.symbols.append(id)

        # Handle comment
        raw_comment = article.raw_comment
        if raw_comment and isinstance(raw_comment, list):
            for item in raw_comment:
                comment_obj = CommentSchema(
                    comment_id=item.get("id"),
                    parent_id=item.get("parent_id"),
                    author=item.get("user", {}).get("username", ""),
                    text=item.get("comment", ""),
                    timestamp=item.get("created_at")
                )
                if comment_obj.text:
                    inserted_id = insert_comment(comment_obj)
                    result.comments.append(inserted_id)

        return result
