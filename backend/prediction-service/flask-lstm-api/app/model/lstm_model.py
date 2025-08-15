from tensorflow.keras.models import load_model as keras_load_model
import joblib
import os
import numpy as np
import tensorflow as tf


def load_model_and_scaler(
    model_path="app/model/crypto_lstm.h5",
    scaler_path="app/model/price_scaler.pkl"
):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
    model = keras_load_model(model_path, compile=False)
    scaler = joblib.load(scaler_path)
    return model, scaler

model, scaler = load_model_and_scaler()
def load_model_default(model_path="app/model/crypto_lstm.h5"):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return keras_load_model(model_path, compile=False)

def load_scaler(scaler_path="app/model/price_scaler.pkl"):
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
    return joblib.load(scaler_path)

def load_model(model_path):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return keras_load_model(model_path, compile=False)

def preprocess_input(data):
    data = np.array(data).reshape(-1, 1)
    scaled_data = scaler.transform(data)
    return scaled_data.reshape(1, SEQ_LEN, 1)

def predict(data):
    processed_data = preprocess_input(data)
    prediction = model.predict(processed_data)
    return scaler.inverse_transform(prediction)