from app.domain.method.Method import Method
from backtesting.lib import crossover

class CrossesUp(Method):
    requires_prev = True
    def __init__(self):
        super().__init__("CrossesUp")
    def compare(self, a, b):
        return bool(crossover(a, b))