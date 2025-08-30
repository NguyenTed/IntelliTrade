import type { BacktestRequest } from "../types/backtest";

const KEY = "backtest:lastConfig:v1";

export function saveBacktestConfig(symbol: string, interval: string, cfg: Partial<BacktestRequest>) {
  try {
    const blob = JSON.parse(localStorage.getItem(KEY) || "{}");
    const key = `${symbol}:${interval}`;
    blob[key] = cfg;
    localStorage.setItem(KEY, JSON.stringify(blob));
  } catch {}
}

export function loadBacktestConfig(symbol: string, interval: string): Partial<BacktestRequest> | null {
  try {
    const blob = JSON.parse(localStorage.getItem(KEY) || "{}");
    const key = `${symbol}:${interval}`;
    return blob[key] ?? null;
  } catch {
    return null;
  }
}