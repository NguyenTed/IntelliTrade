
import pandas_ta as ta
from app.domain.indicator.Indicator import Indicator
import pandas as pd

class SMAIndicator(Indicator):
    def __init__(self, window: int):
        super().__init__(window, "SMA", "SMA indicator")
    def bt_callable(self):
        L = self.window
        def fn(close_np, *args):
            close_series = pd.Series(close_np)
            result = ta.sma(close_series, length=L)
            return self._series_out(result)
        return fn, ()