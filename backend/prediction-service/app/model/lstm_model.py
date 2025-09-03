# app/model/lstm_model.py
import os
import joblib
import numpy as np

from tensorflow.keras.models import load_model as keras_load_model
from tensorflow.keras.layers import InputLayer as TFInputLayer

# ---- Patch InputLayer để tương thích file .h5 cũ (batch_shape -> batch_input_shape)
class InputLayerCompat(TFInputLayer):
    def __init__(self, *args, **kwargs):
        if "batch_shape" in kwargs and "batch_input_shape" not in kwargs:
            kwargs["batch_input_shape"] = kwargs.pop("batch_shape")
        super().__init__(*args, **kwargs)

# ---- Đường dẫn mặc định có thể override bằng ENV
DEFAULT_MODEL_PATH = os.getenv("MODEL_PATH", "app/model/crypto_lstm.h5")
DEFAULT_SCALER_PATH = os.getenv("SCALER_PATH", "app/model/price_scaler.pkl")

# ---- Cache đơn giản để không load lại mỗi request
_CACHE = {}

def _ensure_exists(path: str, kind: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"{kind} file not found: {path}")

def load_model_and_scaler(model_path: str = DEFAULT_MODEL_PATH,
                          scaler_path: str = DEFAULT_SCALER_PATH,
                          use_cache: bool = True):
    """
    Load Keras model (.h5) và scaler (joblib). Có cache.
    """
    if use_cache and "ms" in _CACHE:
        return _CACHE["ms"]

    _ensure_exists(model_path, "Model")
    _ensure_exists(scaler_path, "Scaler")

    model = keras_load_model(
        model_path,
        compile=False,
        custom_objects={"InputLayer": InputLayerCompat}
    )
    scaler = joblib.load(scaler_path)

    if use_cache:
        _CACHE["ms"] = (model, scaler)
    return model, scaler

def load_model_default(model_path: str = DEFAULT_MODEL_PATH):
    _ensure_exists(model_path, "Model")
    return keras_load_model(
        model_path,
        compile=False,
        custom_objects={"InputLayer": InputLayerCompat}
    )

def load_scaler(scaler_path: str = DEFAULT_SCALER_PATH):
    _ensure_exists(scaler_path, "Scaler")
    return joblib.load(scaler_path)

def load_model_generic(model_path: str):
    _ensure_exists(model_path, "Model")
    return keras_load_model(
        model_path,
        compile=False,
        custom_objects={"InputLayer": InputLayerCompat}
    )

def _get_seq_len_and_features(model):
    """
    Suy ra (seq_len, n_features) từ input_shape. Thường là (None, seq_len, features).
    """
    shape = model.input_shape
    if isinstance(shape, (list, tuple)) and isinstance(shape[0], (list, tuple)):
        # một số model có nhiều input -> lấy input đầu
        shape = shape[0]
    # Kỳ vọng dạng (None, T, F)
    seq_len = int(shape[1]) if shape is not None and len(shape) >= 3 and shape[1] is not None else 1
    n_features = int(shape[2]) if shape is not None and len(shape) >= 3 and shape[2] is not None else 1
    return seq_len, n_features

def preprocess_input(values, scaler=None, model=None, pad_mode: str = "pre"):
    """
    values: list/ndarray giá trị thô (giá đóng cửa,...)
    Trả về tensor shape (1, seq_len, n_features).
    """
    if model is None or scaler is None:
        model, scaler = load_model_and_scaler()

    seq_len, n_features = _get_seq_len_and_features(model)

    arr = np.asarray(values, dtype=np.float32).reshape(-1)  # (N,)
    if arr.size == 0:
        raise ValueError("Input 'values' rỗng.")

    # Đảm bảo đúng độ dài seq_len: cắt hoặc pad
    if arr.size > seq_len:
        arr = arr[-seq_len:]  # lấy đoạn cuối
    elif arr.size < seq_len:
        if pad_mode == "pre":
            pad_val = arr[0]  # hoặc 0.0 tuỳ bạn
            pad = np.full((seq_len - arr.size,), pad_val, dtype=np.float32)
            arr = np.concatenate([pad, arr], axis=0)
        else:  # pad_mode == "post"
            pad_val = arr[-1]
            pad = np.full((seq_len - arr.size,), pad_val, dtype=np.float32)
            arr = np.concatenate([arr, pad], axis=0)

    # Scale theo scaler (expects shape (T, 1))
    arr_2d = arr.reshape(-1, 1)
    scaled = scaler.transform(arr_2d)

    # Reshape thành (1, T, F)
    if n_features == 1:
        x = scaled.reshape(1, seq_len, 1)
    else:
        # nếu model đòi nhiều feature, bạn cần chuẩn bị đủ cột trước khi transform
        raise ValueError(f"Model yêu cầu {n_features} features, nhưng code hiện chỉ chuẩn hoá 1 feature.")

    return x

def predict(values):
    """
    Dự đoán giá tiếp theo theo pipeline: preprocess -> model.predict -> inverse_transform
    """
    model, scaler = load_model_and_scaler()
    x = preprocess_input(values, scaler=scaler, model=model)
    y_scaled = model.predict(x, verbose=0)  # shape (1, 1) hoặc (1, T, 1) tuỳ kiến trúc
    # Giả định đầu ra là 1 bước dự báo và cùng thang đo với scaler:
    y_scaled_2d = np.asarray(y_scaled).reshape(-1, 1)
    y = scaler.inverse_transform(y_scaled_2d).ravel()
    return float(y[-1]) if y.size > 0 else None
