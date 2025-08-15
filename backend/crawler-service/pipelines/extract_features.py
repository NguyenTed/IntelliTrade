from bs4 import BeautifulSoup
import soupsieve as sv
from config.constants import VNEXPRESS_DIR, TRADINGVIEW_DIR
from db.models.article_label_model import find_all_article_labels
from db.models.article_model import find_all_articles
from db.models.labeled_data_model import insert_labeled_datas
from app.schemas.article_schema import ArticleSchema
from app.schemas.article_label_schema import ArticleLabelSchema
from app.schemas.labeled_data_schema import LabeledDataSchema
from typing import List



class FeatureExtractor:
    def __init__(self):
        self.article_labels: ArticleLabelSchema = find_all_article_labels()

    def get_label(self, tag, source):
        for rule in self.article_labels:
            try:
                if sv.match(rule.selector, tag) and source == rule.source:
                    return rule.label
            except Exception:
                continue
        return "unlabeled"

    def get_depth(self, tag):
        depth = 0
        while tag.parent is not None:
            tag = tag.parent
            depth += 1
        return depth

    def extract_features_from_html(self, article: ArticleSchema) -> List[LabeledDataSchema]:
        html = article.html
        soup = BeautifulSoup(html, "lxml")
        datas = []

        for tag in soup.find_all(True):
            if tag.name in ['script', 'style', 'meta', 'link', 'svg', 'noscript']:
                continue

            text = tag.get_text(strip=True)
            if not text and tag.name != "img": 
                continue

            label = self.get_label(tag, article.source)

            data = LabeledDataSchema(
                tag=tag.name,
                className=tag.get("class")[0] if tag.get("class") else "",
                depth=self.get_depth(tag),
                textLength=len(text),
                hasImg=bool(tag.find("img")),
                label=label,
                source=article.source 
            )

            datas.append(data)

        return datas

    def extract_all_labels_to_db(self):
        all_data: List[LabeledDataSchema] = []

        articles: List[ArticleSchema] = find_all_articles()

        for article in articles:
            features = self.extract_features_from_html(article)
            all_data.extend(features)
        
        insert_labeled_datas(all_data)
        






# Main
# if __name__ == "__main__":
    # label_file = os.path.join(TRADINGVIEW_DIR, f"article_labels.json")
    # output_csv = os.path.join(TRADINGVIEW_DIR, f"labeled_data.csv")
    # extractor = FeatureExtractor(TRADINGVIEW_DIR, label_file, output_csv)
    # extractor.process_all_articles()