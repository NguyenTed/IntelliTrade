from abc import ABC, abstractmethod
from typing import Callable, Tuple, Any
import pandas as pd
import numpy as np


class Indicator(ABC):
    name = ""
    description = ""
    window = 0

    def __init__(self, window: int = 0, name: str = "", description: str = ""):
        if not isinstance(window, int) or window <= 0:
            raise ValueError("window must be a positive integer")
        self.name = name
        self.description = description
        self.window = window
    
    def _series_out(self, series: pd.Series) -> np.ndarray:
        return series.fillna(0).to_numpy()

    @abstractmethod
    def bt_callable(self) -> Tuple[Callable, Tuple[Any, ...]]:
        ...
