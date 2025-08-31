import { useCallback, useMemo, useState } from "react";
import { postBacktest } from "../api/backtest";
import type { BacktestRequest, BacktestResponse } from "../types/backtest";
import { loadBacktestConfig, saveBacktestConfig } from "../utils/backtest.persistence";

export function useBacktest(symbol: string, interval: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResponse | null>(null);

  const lastConfig = useMemo(
    () => loadBacktestConfig(symbol, interval),
    [symbol, interval]
  );

  const run = useCallback(async (req: BacktestRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postBacktest(req);
      setResult(res);
      saveBacktestConfig(symbol, interval, {
        ...req,
        // do not save huge arrays
        rules: req.rules,
      });
      return res;
    } catch (e: any) {
      setError(e?.message ?? "Backtest failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, result, run, reset, lastConfig };
}