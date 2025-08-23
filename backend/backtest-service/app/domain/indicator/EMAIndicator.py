from app.domain.indicator.Indicator import Indicator
import pandas_ta as ta
import pandas as pd

class EMAIndicator(Indicator):
    def __init__(self, window: int):
        super().__init__(window, "EMA", "EMA indicator")
    def bt_callable(self):
        L = self.window
        def fn(close_np, *args):
            close_series = pd.Series(close_np)
            result = ta.ema(close_series, length=L)
            return self._series_out(result)
        return fn, ()