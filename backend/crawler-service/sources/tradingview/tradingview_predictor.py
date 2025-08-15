from sources.base import BasePredictor
from bs4 import BeautifulSoup
import numpy as np
import pandas as pd
from ultils.get_tag_depth import get_depth
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
        
        for tag in tags:
            if tag.name in IGNORE_TAGS:
                continue
            text = tag.get_text(strip=True)
            if not text:
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
                result.symbols.append(text)
                # Save symbol to db
                symbol = SymbolSchema(name=text, source=ArticleType.TRADINGVIEW.value)
                insert_symbol(symbol)
            elif label == "tag":
                result.tags.append(text)
                # Save tag to db
                tag = TagSchema(name=text, source=ArticleType.TRADINGVIEW.value)
                insert_tag(tag)

        # Handle comment
        raw_comment = article.raw_comment
        if raw_comment:
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
