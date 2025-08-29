from db.models.predicted_article_model import (
    find_predicted_articles,
    update_sentiment
)
from transformers import pipeline
from typing import List
from pydantic import BaseModel
import os

# ⚙️ CONFIG
MODEL_NAME = os.getenv("SENTIMENT_MODEL_NAME", "cardiffnlp/twitter-xlm-roberta-base-sentiment")
DEVICE = 0 if os.getenv("SENTIMENT_DEVICE", "cpu") == "cuda" else -1
MAX_CHARS = int(os.getenv("SENTIMENT_MAX_CHARS", "1200"))

# ✅ Load model 1 lần
sentiment_pipe = pipeline("sentiment-analysis", model=MODEL_NAME, device=DEVICE)

# 🧠 Chuẩn hóa nhãn
LABEL_MAP = {
    "POSITIVE": "POSITIVE",
    "NEGATIVE": "NEGATIVE",
    "NEUTRAL": "NEUTRAL",
    "LABEL_0": "NEGATIVE",
    "LABEL_1": "NEUTRAL",
    "LABEL_2": "POSITIVE",
    "1 STAR": "NEGATIVE",
    "2 STARS": "NEGATIVE",
    "3 STARS": "NEUTRAL",
    "4 STARS": "POSITIVE",
    "5 STARS": "POSITIVE",
}

class SentimentResult(BaseModel):
    label: str
    score: float

def join_and_trim(texts: List[str], max_chars: int) -> str:
    joined = " ".join(filter(None, texts))
    return joined[:max_chars]

def predict_sentiment(text: str) -> SentimentResult:
    result = sentiment_pipe(text[:512])[0]  # tránh quá dài cho HF models
    label = LABEL_MAP.get(result["label"].upper(), "NEUTRAL")
    return SentimentResult(label=label, score=float(result["score"]))

def run_predict_sentiments():
    articles = find_predicted_articles()
    count = 0

    for article in articles:
        try:
            # Ghép text
            title = article.title or ""
            content = article.content or []
            merged_text = join_and_trim([title] + content, MAX_CHARS)

            sentiment = predict_sentiment(merged_text)

            update_sentiment(article.id, sentiment.model_dump())
            count += 1

        except Exception as e:
            print(f"[❌] Error in sentiment for article {article.url}: {e}")

    print(f"[✅] Done. {count} articles updated with sentiment.")

if __name__ == "__main__":
    run_predict_sentiments()
