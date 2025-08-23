from typing import List
from dataclasses import asdict, dataclass

from app.dto.response.StatDTO import StatDTO
from app.dto.response.TradeDTO import TradeDTO

@dataclass
class BacktestResultDTO:
    trades: List[TradeDTO]
    stats: StatDTO
    def to_dict(self):
        return {
            "trades": [asdict(t) for t in self.trades],
            "stats": asdict(self.stats)
        }