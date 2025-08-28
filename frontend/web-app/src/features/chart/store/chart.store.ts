import { create } from "zustand";

export type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w" | "1M";

type ChartState = {
  symbol: string;
  interval: Interval;
  showEMA20: boolean;
  showSMA50: boolean;
  showVolume: boolean;
  setSymbol: (s: string) => void;
  setInterval: (i: Interval) => void;
  toggle: (k: "showEMA20" | "showSMA50" | "showVolume") => void;
};

export const useChartState = create<ChartState>((set) => ({
  symbol: "BTCUSDT",
  interval: "1m",
  showEMA20: false,
  showSMA50: false,
  showVolume: false,
  setSymbol: (symbol) => set({ symbol }),
  setInterval: (interval) => set({ interval }),
  toggle: (key) => set((s) => ({ ...s, [key]: !s[key] })),
}));