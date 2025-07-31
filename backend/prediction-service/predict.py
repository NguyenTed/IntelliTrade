import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from fetch_data import fetch_binance_data  # nếu bạn viết fetch trong train.py

SEQ_LEN = 60

def predict_next_price(symbol="BTCUSDT", interval="1d"):
    # 1. Load mô hình & scaler
    model = load_model("crypto_lstm.h5",compile=False)
    scaler = joblib.load("price_scaler.pkl")

    # 2. Lấy dữ liệu nến gần nhất
    df = fetch_binance_data(symbol=symbol, interval=interval, limit=1000)
    close_prices = df["close"].values.reshape(-1, 1)

    # 3. Scale + tạo chuỗi đầu vào
    scaled = scaler.transform(close_prices)
    X_input = scaled[-SEQ_LEN:].reshape(1, SEQ_LEN, 1)

    # 4. Dự đoán
    scaled_pred = model.predict(X_input, verbose=0)[0][0]
    predicted_price = scaler.inverse_transform([[scaled_pred]])[0][0]

    return float(predicted_price)

# Dùng thử
if __name__ == "__main__":
    price = predict_next_price("BTCUSDT")
    print(f"🎯 Giá BTCUSDT dự đoán tiếp theo: {price:.2f} USDT")
