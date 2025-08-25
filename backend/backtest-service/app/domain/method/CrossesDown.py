
from backtesting.lib import crossover
from app.domain.method.Method import Method


class CrossesDown(Method):
    requires_prev = True
    def __init__(self):
        super().__init__("CrossesDown")
    def compare(self, a, b):
        return bool(crossover(b, a))