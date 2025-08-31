from dataclasses import dataclass


@dataclass
class StatDTO:
    # thời gian
    start: str = ""
    end: str = ""
    duration: str = ""

    # khối chính (ảnh 1)
    exposure_time_pct: float = 0.0
    equity_final_usd: float = 0.0
    equity_peak_usd: float = 0.0
    return_pct: float = 0.0
    buy_hold_return_pct: float = 0.0
    return_ann_pct: float = 0.0
    volatility_ann_pct: float = 0.0
    sharpe_ratio: float = 0.0
    sortino_ratio: float = 0.0

    max_drawdown_pct: float = 0.0          # "Max. Drawdown [%]"
    avg_drawdown_pct: float = 0.0          # "Avg. Drawdown [%]"
    max_drawdown_duration: str = ""        # "Max. Drawdown Duration"
    avg_drawdown_duration: str = ""        # "Avg. Drawdown Duration"
    avg_trade_pct: float = 0.0             # "Avg. Trade [%]"
    max_trade_duration: str = ""           # "Max. Trade Duration"
    avg_trade_duration: str = ""           # "Avg. Trade Duration"
    expectancy_pct: float = 0.0            # "Expectancy [%]"
    sqn: float = 0.0                        # "SQN"

    win_rate: float = 0.0                  # "Win Rate [%]"
    best_trade: float = 0.0                # "Best Trade [%]"
    worst_trade: float = 0.0               # "Worst Trade [%]"
    trades_count: int = 0                  # "# Trades"