
import numpy as np
from app.domain.method.Method import Method


class BelowOrEqual(Method):
    def __init__(self):
        super().__init__("BelowOrEqual")
    def compare(self, a, b):
        a1 = float(a[-1]); b1 = float(b[-1] if hasattr(b, "__len__") else b)
        if not (np.isfinite(a1) and np.isfinite(b1)): return False
        return a1 <= b1