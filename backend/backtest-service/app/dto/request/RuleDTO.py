

from dataclasses import dataclass
from app.dto.request.Side import Side



@dataclass
class RuleDTO:
    left: Side
    op: str
    right: Side
