from dataclasses import dataclass

@dataclass
class Side:
    type: str
    window: int = 0
    const: float = 0.0