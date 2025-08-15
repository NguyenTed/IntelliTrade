import os
import numpy as np
import tensorflow as tf
from cachetools import TTLCache

from app.model.lstm_model import load_model_and_scaler, load_scaler, load_model_default, load_model
from app.repository.model_repository import get_model_path

scaler = load_scaler()
default_model = load_model_default()

model_cache = TTLCache(maxsize=30, ttl=600)

def predict_next_close(closes, seq_len=60, user_id=None, model_name=None):
    model = default_model

    if user_id is not None and model_name is not None:
        model = get_user_model(user_id, model_name)

    closes_np = closes.reshape(-1, 1)
    scaled = scaler.transform(closes_np)
    X_input = scaled[-seq_len:].reshape(1, seq_len, 1)

    pred_scaled = model.predict(X_input, verbose=0)[0][0]
    predicted_price = scaler.inverse_transform([[pred_scaled]])[0][0]
    latest_close = closes[-1]
    trend = "UP" if predicted_price > latest_close else "DOWN"

    return {
        'predicted_close_price': round(float(predicted_price), 2),
        'latest_close_price': round(float(latest_close), 2),
        'trend': trend
    }

def get_user_model(user_id, model_name):
    cache_key = (user_id, model_name)
    print(f"[DEBUG] Fetching model for user {user_id}, model {model_name} with cache key {cache_key}")
    if cache_key in model_cache:
        return model_cache[cache_key]
    model_path = get_model_path(user_id, model_name)
    if model_path is None or not os.path.exists(model_path):
        return default_model
    try:
        model = load_model(model_path)
        model_cache[cache_key] = model
        return model
    except Exception as e:
        print(f"[ERROR] Cannot load model from {model_path}: {e}")
        return default_model
