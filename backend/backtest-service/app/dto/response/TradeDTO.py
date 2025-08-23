from dataclasses import dataclass
from typing import Any

@dataclass
class TradeDTO:
    Size: float
    EntryBar: int
    ExitBar: int
    EntryPrice: float
    ExitPrice: float
    SL: float
    TP: float
    ReturnPct: float
    EntryTime: str
    ExitTime: str
    Duration: str
    Tag: Any
    Entry_fn: float
    Exit_fn: float