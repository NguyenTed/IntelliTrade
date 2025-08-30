from abc import ABC, abstractmethod
import numpy as np
from typing import Union

class Method(ABC):
    def __init__(self, name: str):
        self.name = name
    requires_prev: bool = False  

    @abstractmethod
    def compare(self, a: np.ndarray, b: Union[np.ndarray, float]) -> bool:
        ...