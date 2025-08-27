export type OHLC = {
  date: Date;        // Important: actual Date object
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};