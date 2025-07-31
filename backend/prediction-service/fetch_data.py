import requests
import pandas as pd
import numpy as np
from datetime import datetime
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
def fetch_binance_data(symbol="BTCUSDT", interval="1d", limit=1000):
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }
    response = requests.get(url, params=params)
    data = response.json()

    df = pd.DataFrame(data, columns=[
        "timestamp", "open", "high", "low", "close", "volume",
        "close_time", "quote_asset_volume", "trades",
        "taker_buy_base", "taker_buy_quote", "ignore"
    ])
    df["close"] = df["close"].astype(float)
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit='ms')
    return df[["timestamp", "close"]]

# 🟩 Gọi và lưu file
df = fetch_binance_data(symbol="BTCUSDT", interval="1d", limit=1000)
df.to_csv("btc_history.csv", index=False)
print("✅ Đã lưu dữ liệu vào btc_history.csv")

fetch_binance_data(symbol="BTCUSDT", interval="1d", limit=1000)

