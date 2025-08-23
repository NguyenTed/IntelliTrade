from datetime import datetime
import pandas as pd
from pyparsing import Union
import requests
def datetime_to_millis(dt: Union[str, datetime]) -> int:
    if isinstance(dt, str):
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(dt, fmt)
                break
            except ValueError:
                continue
        if isinstance(dt, str):
            raise ValueError(f"Invalid datetime format: {dt}")
    return int(dt.timestamp() * 1000)

def fetch_all_ohlcv(symbol: str, interval: str,
                    start_time: Union[str, datetime],
                    end_time: Union[str, datetime]) -> pd.DataFrame:
    print(start_time)
    print(end_time)
    start_ms = datetime_to_millis(start_time)
    end_ms = datetime_to_millis(end_time)

    if start_ms >= end_ms:
        raise ValueError("start_time must be before end_time")

    all_data = []

    while start_ms < end_ms:
        url = "https://api.binance.com/api/v3/klines"
        params = {
            "symbol": symbol.upper(),
            "interval": interval,
            "startTime": start_ms,
            "endTime": end_ms,
            "limit": 1000
        }
        res = requests.get(url, params=params, timeout=15)
        res.raise_for_status()
        batch = res.json()
        if not batch:
            break

        all_data += batch
        last_open_time = batch[-1][0]  # int millis

        # Tránh loop vô hạn
        if last_open_time <= start_ms:
            start_ms += 1
        else:
            start_ms = last_open_time + 1

    if not all_data:
        return pd.DataFrame(columns=["Open", "High", "Low", "Close", "Volume"])

    df = pd.DataFrame(all_data, columns=[
        "Open Time", "Open", "High", "Low", "Close", "Volume",
        "Close Time", "Quote Asset Volume", "Number of Trades",
        "Taker Buy Base", "Taker Buy Quote", "Ignore"
    ])
    df["Open Time"] = pd.to_datetime(df["Open Time"], unit="ms", utc=True).dt.tz_convert(None)
    df.set_index("Open Time", inplace=True)
    df = df[["Open", "High", "Low", "Close", "Volume"]].astype(float)
    return df