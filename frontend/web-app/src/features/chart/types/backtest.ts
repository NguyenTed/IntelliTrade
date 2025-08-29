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
  best_trade: number;
  duration: string;
  end: string;
  equity_final: number;
  equity_peak: number;
  exposure_time: number;
  max_drawdown: number;
  return_pct: number;
  start: string;
  trades_count: number;
  win_rate: number;
  worst_trade: number;
};

export type BacktestTrade = {
  EntryTime: string;
  ExitTime: string;
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