from app.domain.indicator import Indicator
from app.domain.indicator.BBANDSIndicator import BBANDSIndicator
from app.domain.indicator.EMAIndicator import EMAIndicator
from app.domain.indicator.MOMIndicator import MOMIndicator
from app.domain.indicator.ROCIndicator import ROCIndicator
from app.domain.indicator.RSIIndicator import RSIIndicator
from app.domain.indicator.SMAIndicator import SMAIndicator

class IndicatorFactory:
    @staticmethod
    def create(indicator_type: str, window: int) -> Indicator:
        if indicator_type == "SMA":
            return SMAIndicator(window)
        elif indicator_type == "EMA":
            return EMAIndicator(window)
        elif indicator_type == "RSI":
            return RSIIndicator(window)
        elif indicator_type == "BBANDS":
            return BBANDSIndicator(window)
        elif indicator_type == "MOM":
            return MOMIndicator(window)
        elif indicator_type == "ROC":
            return ROCIndicator(window)
        else:
            raise ValueError(f"Unknown indicator type: {indicator_type}")