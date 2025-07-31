import requests
import numpy as np

def fetch_binance_closes(symbol, interval="1d", limit=1000):
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    resp = requests.get(url)
    if resp.status_code != 200:
        raise Exception("Failed to fetch data from Binance")
    klines = resp.json()
    closes = [float(k[4]) for k in klines]
    return np.array(closes)