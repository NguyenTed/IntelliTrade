import requests
import numpy as np

def fetch_binance_closes(symbol, interval="1d", limit=1000):
    url = "http://market-service:8085/market/history"
    params = {"symbol": symbol, "interval": interval, "limit": limit}
    resp = requests.get(url, params=params)
    if resp.status_code != 200:
        raise Exception("Failed to fetch data from local prediction API")
    candles = resp.json()  # giả sử trả về list dict, mỗi dict là 1 CandleDto
    closes = [float(candle["close"]) for candle in candles]
    return np.array(closes)