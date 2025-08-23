import joblib
from abc import ABC, abstractmethod


class BaseCrawler(ABC):
    pass

class BasePredictor:
    def __init__(self):
        self.model, self.encoder = joblib.load("model/general_model.pkl")

    def predict_idea(self) -> dict:
        raise NotImplementedError("Subclass must implement predict()")
