from typing import Dict, List, Tuple
import numpy as np
from app.domain.method import Method
from app.domain.strategy.build_strategy import build_strategy
from app.dto.request.StrategyConfigDTO import StrategyConfigDTO
import pandas as pd
from backtesting.lib import FractionalBacktest
from app.dto.response.BacktestResultDTO import BacktestResultDTO

from app.dto.response.StatDTO import StatDTO
from app.dto.response.TradeDTO import TradeDTO
from app.service.historical_service import fetch_all_ohlcv

def run_backtest_strategy(cfg: StrategyConfigDTO) -> pd.DataFrame:
    data = fetch_all_ohlcv(cfg.symbol, cfg.interval, cfg.startTime, cfg.endTime)
    strategy = build_strategy(cfg)
    bt = FractionalBacktest(data, strategy, cash=cfg.lots, commission=0.001)
    stats = bt.run()
    return convert_backtest_result(stats)

def convert_backtest_result(stats) -> BacktestResultDTO:
    trades_df: pd.DataFrame = stats._trades.fillna(np.nan)

    trades = []
    for _, row in trades_df.iterrows():
        trades.append(TradeDTO(
            Size=row["Size"],
            EntryBar=row["EntryBar"],
            ExitBar=row["ExitBar"],
            EntryPrice=row["EntryPrice"],
            ExitPrice=row["ExitPrice"],
            SL=row["SL"],
            TP=row["TP"],
            ReturnPct=row["ReturnPct"],
            EntryTime=str(row["EntryTime"]),
            ExitTime=str(row["ExitTime"]),
            Duration=str(row["Duration"]),
            Tag=row.get("Tag"),
            Entry_fn=row.get("Entry_fn(C)", None),
            Exit_fn=row.get("Exit_fn(C)", None)
        ))

    sdict = stats.to_dict()
    stats_dto = StatDTO(
    start=str(sdict.get("Start", "")),
    end=str(sdict.get("End", "")),
    duration=str(sdict.get("Duration", "")),
    exposure_time=float(sdict.get("Exposure Time [%]", 0)),
    equity_final=float(sdict.get("Equity Final [$]", 0)),
    equity_peak=float(sdict.get("Equity Peak [$]", 0)),
    return_pct=float(sdict.get("Return [%]", 0)),
    win_rate=float(sdict.get("Win Rate [%]", 0)),
    best_trade=float(sdict.get("Best Trade [%]", 0)),
    worst_trade=float(sdict.get("Worst Trade [%]", 0)),
    max_drawdown=float(sdict.get("Max. Drawdown [%]", 0)),
    trades_count=int(sdict.get("# Trades", 0))
)

    return BacktestResultDTO(trades=trades, stats=stats_dto).to_dict()