from datetime import datetime
import pandas as pd
from typing import Union
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

def fetch_all_ohlcv(
    symbol: str,
    interval: str,
    start_time: Union[str, datetime],
    end_time: Union[str, datetime],
) -> pd.DataFrame:
    start_ms = datetime_to_millis(start_time)
    end_ms = datetime_to_millis(end_time)

    if start_ms >= end_ms:
        raise ValueError("start_time must be before end_time")

    all_rows = []
   
    while start_ms < end_ms:
        url = " http://market-service:8085/market/history"
        params = {
            "symbol": symbol.upper(),
            "interval": interval,
            "startTime": start_ms,
            "endTime": end_ms,
            "limit": 1000,
        }
        res = requests.get(url, params=params, timeout=15)
        res.raise_for_status()

        batch = res.json()
        # Cho phép trường hợp service bọc dữ liệu trong "data"
        if isinstance(batch, dict):
            data = batch.get("data", [])
        else:
            data = batch

        if not data:
            break

        all_rows.extend(data)
        # data[-1] là CandleDto dạng dict -> lấy openTime cuối cùng
        last_open_time = data[-1].get("openTime")
        if last_open_time is None:
            break

        # Tránh lặp vô hạn
        if last_open_time <= start_ms:
            start_ms += 1
        else:
            start_ms = last_open_time + 1

    if not all_rows:
        return pd.DataFrame(columns=["Open", "High", "Low", "Close", "Volume"])

    # Tạo DataFrame từ list[dict] CandleDto
    df = pd.DataFrame(all_rows)

    # Đổi tên cột sang chuẩn dùng nội bộ
    rename_map = {
        "openTime": "Open Time",
        "open": "Open",
        "high": "High",
        "low": "Low",
        "close": "Close",
        "volume": "Volume",
    }
    missing = [k for k in rename_map.keys() if k not in df.columns]
    if missing:
        raise ValueError(f"Missing expected fields from service: {missing}")

    df = df.rename(columns=rename_map)

    # Chuẩn hoá thời gian & index
    df["Open Time"] = pd.to_datetime(df["Open Time"], unit="ms", utc=True).dt.tz_convert(None)
    df = df.set_index("Open Time").sort_index()

    # Chỉ giữ các cột OHLCV, ép kiểu float
    df = df[["Open", "High", "Low", "Close", "Volume"]].astype(float)

    # Loại trùng timestamp nếu có (giữ bản ghi mới nhất)
    df = df[~df.index.duplicated(keep="last")]

    return df
