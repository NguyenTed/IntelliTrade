from config.constants import VNEXPRESS_LISTING_URL, VNEXPRESS_DIR
from sources.base import BasePredictor
from bs4 import BeautifulSoup
import numpy as np
import pandas as pd
import re
from utils.get_tag_depth import get_depth
from app.schemas.predicted_article_schema import PredictedArticleSchema
from app.schemas.article_schema import ArticleSchema
from app.schemas.predicted_article_schema import PredictedArticleSchema
from app.schemas.comment_schema import CommentSchema
from db.models.article_model import find_article_by_id
from db.models.comment_model import insert_comment
from bson import ObjectId


IGNORE_TAGS = {'script', 'style', 'meta', 'link', 'noscript', 'svg'}


class VnExpressPredictor(BasePredictor):

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
            if not text or re.search(r'[{}();]|var |function |googletag|window\.|\.push\(', text):
                continue

            tag_name = tag.name
            tag_class = tag.get("class")[0] if tag.get("class") else ""
            depth = get_depth(tag)
            text_len = len(text)
            has_img = bool(tag.find("img"))

            df_input = pd.DataFrame([[tag_name, tag_class, "vnexpress"]], columns=["tag", "class", "source"])
            categorical = self.encoder.transform(df_input)
            numeric = np.array([[depth, text_len, has_img]])
            features = np.concatenate([categorical, numeric], axis=1)

            label = self.model.predict(features)[0]
            if label == "title" and not result.title:
                result.title = text
            elif label == "content":
                result.content.append(text)

        # Handle comment
        raw_comment = article.raw_comment
        if raw_comment is not None and raw_comment.get("items"):
            for item in raw_comment["items"]:
                comment_obj = CommentSchema(
                    comment_id=item.get("comment_id"),
                    parent_id=item.get("parent_id"),
                    author=item.get("full_name", ""),
                    text=item.get("content", ""),
                    timestamp=item.get("time", "")
                )
                if comment_obj.text:
                    inserted_id = insert_comment(comment_obj)
                    result.comments.append(inserted_id)

        return result