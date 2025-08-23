
from narwhals import Enum


class IndicatorType(str, Enum):
    CONST = "CONST"
    SMA = "SMA"
    EMA = "EMA"
    RSI = "RSI"
    MACD = "MACD"
    BBANDS = "BBANDS"
    MOM = "MOM"
    ROC = "ROC"
