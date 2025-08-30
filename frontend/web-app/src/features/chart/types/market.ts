export type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w" | "1M";

export type Candle = {
  time: number; // UTCTimestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LiveBarUpdate = {
  symbol: string;
  interval: Interval;
  time: number | string | Date; // server may send any
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isFinal: boolean;
};