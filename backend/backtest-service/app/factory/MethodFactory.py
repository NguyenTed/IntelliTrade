
from typing import Dict, Type

from app.domain.method.Above import Above
from app.domain.method.AboveOrEqual import AboveOrEqual
from app.domain.method.Below import Below
from app.domain.method.BelowOrEqual import BelowOrEqual
from app.domain.method.CrossesDown import CrossesDown
from app.domain.method.CrossesUp import CrossesUp
from app.domain.method.Method import Method


class MethodFactory:
    _registry: Dict[str, Type[Method]] = {
        "Above": Above,
        "Below": Below,
        "CrossesUp": CrossesUp,
        "CrossesDown": CrossesDown,
        "AboveOrEqual": AboveOrEqual,
        "BelowOrEqual": BelowOrEqual,
    }

    @staticmethod
    def create(operation: str) -> Method:
        if operation in MethodFactory._registry:
            return MethodFactory._registry[operation]()
        raise ValueError(f"Unknown method: {operation}")