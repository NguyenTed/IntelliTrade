import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

SEQ_LEN = 60
EPOCHS  = 20
BATCH   = 32

# --- Chuẩn bị dữ liệu ---
df = pd.read_csv("btc_history.csv")
close_prices = df["close"].values.reshape(-1, 1)

scaler = MinMaxScaler()
scaled  = scaler.fit_transform(close_prices)

# Tạo sequence
X, y = [], []
for i in range(SEQ_LEN, len(scaled)):
    X.append(scaled[i-SEQ_LEN:i])
    y.append(scaled[i])
X, y = np.array(X), np.array(y)

# Train/Test split (80/20)
split = int(len(X)*0.8)
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# --- Xây mô hình ---
model = Sequential([
    LSTM(50, return_sequences=True, input_shape=(SEQ_LEN, 1)),
    Dropout(0.2),
    LSTM(50),
    Dropout(0.2),
    Dense(1)
])
model.compile(optimizer='adam', loss='mse')

# --- Huấn luyện ---
model.fit(X_train, y_train,
          validation_data=(X_test, y_test),
          epochs=EPOCHS,
          batch_size=BATCH)

# --- Lưu mô hình ---
model.save("crypto_lstm.h5")        # chứa cả kiến trúc & trọng số
# Nếu muốn tách:
# model_json = model.to_json()
# with open("crypto_lstm.json","w") as f: f.write(model_json)
# model.save_weights("crypto_lstm_weights.h5")
# scaler lưu lại để dùng đúng scale
import joblib
joblib.dump(scaler, "price_scaler.pkl")
