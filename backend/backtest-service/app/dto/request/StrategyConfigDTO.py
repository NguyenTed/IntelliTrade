from dataclasses import dataclass
from datetime import datetime
from typing import List
from datetime import datetime
from typing import Optional

from app.dto.request.RuleDTO import RuleDTO

@dataclass
class StrategyConfigDTO:
    symbol: str
    interval: str
    lots: float
    slPct: float
    tpPct: float
    rules: List[RuleDTO]
    buyCondition: str
    sellCondition: str
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
