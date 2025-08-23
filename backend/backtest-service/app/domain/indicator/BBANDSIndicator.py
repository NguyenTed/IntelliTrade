import pandas as pd
from app.domain.indicator.Indicator import Indicator
import pandas_ta as ta
class BBANDSIndicator(Indicator):
    def __init__(self, window: int, band: str = "middle"):
        super().__init__(window, "BBANDS", f"Bollinger Bands ({band})")
        band = band.lower()
        if band not in {"lower", "middle", "upper", "percent", "bandwidth"}:
            raise ValueError("band must be one of lower|middle|upper|percent|bandwidth")
        self.band = band

    def bt_callable(self):
        L, which = self.window, self.band

        def fn(close_np, *args):
            close_series = pd.Series(close_np)
            df = ta.bbands(close_series, length=L)
            if df is None or df.empty:
                return self._series_out(pd.Series(index=close_series.index, dtype=float))

            if which == "lower":
                col = next(c for c in df.columns if c.startswith("BBL_"))
            elif which == "middle":
                col = next(c for c in df.columns if c.startswith("BBM_"))
            elif which == "upper":
                col = next(c for c in df.columns if c.startswith("BBU_"))
            elif which == "bandwidth":
                col = next(c for c in df.columns if c.startswith("BBB_"))
            else:
                col = next(c for c in df.columns if c.startswith("BBP_"))

            return self._series_out(df[col])

        return fn, ()