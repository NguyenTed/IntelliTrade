from dataclasses import dataclass


@dataclass
class StatDTO:
    start: str
    end: str
    duration: str
    exposure_time: float
    equity_final: float
    equity_peak: float
    return_pct: float
    win_rate: float
    best_trade: float
    worst_trade: float
    max_drawdown: float
    trades_count: int