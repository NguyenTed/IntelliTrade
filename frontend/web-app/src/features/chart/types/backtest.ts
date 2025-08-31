export type IndicatorType = "SMA" | "EMA"; // grow later
export type CompareOp =
  | "Above"
  | "Below"
  | "AboveOrEqual"
  | "BelowOrEqual"
  | "Equal"
  | "CrossesAbove"
  | "CrossesBelow";

export type RuleSide = {
  type: IndicatorType;
  window: number;
};

export type Rule = {
  left: RuleSide;
  op: CompareOp;
  right: RuleSide;
};

export type BacktestRequest = {
  symbol: string;
  interval: string; // reuse your Interval type if you want
  lots: number;
  slPct: number;
  tpPct: number;
  rules: Rule[];
  buyCondition: string;
  sellCondition: string;
  startTime: string; // ISO
  endTime: string; // ISO
};

export type BacktestStats = {
  // Return & performance
  return_pct: number;                // total % return
  return_ann_pct: number;            // annualized % return
  buy_hold_return_pct: number;       // benchmark buy & hold
  volatility_ann_pct: number;        // annualized volatility
  sharpe_ratio: number;
  sortino_ratio: number;
  sqn: number;
  expectancy_pct: number;            // average expectancy per trade
  avg_trade_pct: number;             // average trade %

  // Risk
  max_drawdown_pct: number;
  avg_drawdown_pct: number;
  equity_peak_usd: number;
  equity_final_usd: number;
  exposure_time_pct: number;         // exposure time in %

  // Timing
  duration: string;                  // e.g., "60 days 00:00:00"
  start: string;                     // ISO-like string from server
  end: string;                       // ISO-like string from server
  avg_trade_duration: string;
  max_trade_duration: string;
  max_drawdown_duration: string;
  avg_drawdown_duration: string;

  // Trades
  trades_count: number;
  win_rate: number;                  // as % value
  best_trade: number;
  worst_trade: number;
};

export type BacktestTrade = {
  EntryTime: string;
  ExitTime: string;
  EntryBar?: number;
  ExitBar?: number;
  EntryPrice: number;
  ExitPrice: number;
  ReturnPct: number;
  SL: number;
  TP: number;
  Size: number;
  Tag: string | number | null;
  // keep optional extra fields without breaking
  [k: string]: unknown;
};

export type BacktestResponse = {
  stats: BacktestStats;
  trades: BacktestTrade[];
};