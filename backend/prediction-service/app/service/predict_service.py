import os
import numpy as np
import tensorflow as tf
from cachetools import TTLCache

from app.model.lstm_model import load_model_and_scaler, load_scaler, load_model_default, load_model_generic as load_model

scaler = load_scaler()
default_model = load_model_default()

model_cache = TTLCache(maxsize=30, ttl=600)

def predict_next_close(closes, seq_len=60, user_id=None, model_name=None, sentiment=None):
    model = default_model

    if user_id is not None and model_name is not None:
        model = get_user_model(user_id, model_name)

    closes_np = closes.reshape(-1, 1)
    scaled = scaler.transform(closes_np)
    X_input = scaled[-seq_len:].reshape(1, seq_len, 1)

    pred_scaled = model.predict(X_input, verbose=0)[0][0]
    predicted_price = scaler.inverse_transform([[pred_scaled]])[0][0]
    if(sentiment=='POSITIVE'):
        predicted_price *= 1.02
    elif(sentiment=='NEGATIVE'):
        predicted_price *= 0.98
    latest_close = closes[-1]
    trend = "UP" if predicted_price > latest_close else "DOWN"

    return {
        'predicted_close_price': round(float(predicted_price), 2),
        'latest_close_price': round(float(latest_close), 2),
        'trend': trend
    }

def get_user_model(user_id, model_name):
    cache_key = (user_id, model_name)
    if cache_key in model_cache:
        return model_cache[cache_key]
    return default_model
