# app/predict_logic.py

import joblib
from bs4 import BeautifulSoup
import numpy as np
import pandas as pd
import re
import json
import os
from config.constants import VNEXPRESS_LISTING_URL

IGNORE_TAGS = {'script', 'style', 'meta', 'link', 'noscript', 'svg'}

model, encoder = joblib.load("model/tradingview_model.pkl")



def predict_article(slug):
    html_path = f"data/vnexpress/{slug}.html"
    comment_path = f"data/vnexpress/{slug}.json"

    result = {
        "url": f"{VNEXPRESS_LISTING_URL}/{slug}.html",
        "title": "",
        "content": [],
        "comments": []
    }

    if not os.path.exists(html_path):
        return {"error": "HTML file not found."}, 404

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

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

        df_input = pd.DataFrame([[tag_name, tag_class]], columns=["tag", "class"])
        categorical = encoder.transform(df_input)
        numeric = np.array([[depth, text_len, has_img]])
        features = np.concatenate([categorical, numeric], axis=1)

        label = model.predict(features)[0]
        if label == "title" and not result["title"]:
            result["title"] = text
        elif label == "content":
            result["content"].append(text)

    if os.path.exists(comment_path):
        with open(comment_path, "r", encoding="utf-8") as f:
            comment_data = json.load(f)
            if "items" in comment_data:
                for item in comment_data["items"]:
                    comment_obj = {
                        "comment_id": item.get("comment_id"),
                        "parent_id": item.get("parent_id"),
                        "author": item.get("full_name", None),
                        "text": item.get("content", "").strip(),
                        "timestamp": item.get("time", None)
                    }
                    if comment_obj["text"]:
                        result["comments"].append(comment_obj)

    return result
