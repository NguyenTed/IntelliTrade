

from dataclasses import dataclass
from websockets import Side


@dataclass
class RuleDTO:
    left: Side
    op: str
    right: Side
