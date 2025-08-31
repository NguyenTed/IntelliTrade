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
def _num(v, typ=float, default=0.0):
    try:
        if v is None or (isinstance(v, float) and np.isnan(v)):
            return default
        return typ(v)
    except Exception:
        return default

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
            Entry_fn=row.get("Entry_fn(C)"),
            Exit_fn=row.get("Exit_fn(C)")
        ))

    sdict = stats.to_dict()

    stats_dto = StatDTO(
        # thời gian
        start=str(sdict.get("Start", "")),
        end=str(sdict.get("End", "")),
        duration=str(sdict.get("Duration", "")),

        # ảnh 1
        exposure_time_pct=_num(sdict.get("Exposure Time [%]")),
        equity_final_usd=_num(sdict.get("Equity Final [$]")),
        equity_peak_usd=_num(sdict.get("Equity Peak [$]")),
        return_pct=_num(sdict.get("Return [%]")),
        buy_hold_return_pct=_num(sdict.get("Buy & Hold Return [%]")),
        return_ann_pct=_num(sdict.get("Return (Ann.) [%]")),
        volatility_ann_pct=_num(sdict.get("Volatility (Ann.) [%]")),
        sharpe_ratio=_num(sdict.get("Sharpe Ratio")),
        sortino_ratio=_num(sdict.get("Sortino Ratio")),

        # ảnh 2
        max_drawdown_pct=_num(sdict.get("Max. Drawdown [%]")),
        avg_drawdown_pct=_num(sdict.get("Avg. Drawdown [%]")),
        max_drawdown_duration=str(sdict.get("Max. Drawdown Duration", "")),
        avg_drawdown_duration=str(sdict.get("Avg. Drawdown Duration", "")),
        avg_trade_pct=_num(sdict.get("Avg. Trade [%]")),
        max_trade_duration=str(sdict.get("Max. Trade Duration", "")),
        avg_trade_duration=str(sdict.get("Avg. Trade Duration", "")),
        expectancy_pct=_num(sdict.get("Expectancy [%]")),
        sqn=_num(sdict.get("SQN")),

        # giữ các trường cũ
        win_rate=_num(sdict.get("Win Rate [%]")),
        best_trade=_num(sdict.get("Best Trade [%]")),
        worst_trade=_num(sdict.get("Worst Trade [%]")),
        trades_count=int(sdict.get("# Trades", 0) or 0),
    )

    return BacktestResultDTO(trades=trades, stats=stats_dto).to_dict()
