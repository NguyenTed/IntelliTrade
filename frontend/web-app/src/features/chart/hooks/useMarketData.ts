import { useEffect, useState } from "react";
import type { OHLC } from "../types/ohlc";
import type { Interval } from "../store/chart.store";
import { fetchOHLC } from "../api/marketData";

export function useMarketData(symbol: string, interval: Interval) {
  const [data, setData] = useState<OHLC[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchOHLC(symbol, interval);
        if (active) setData(d);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [symbol, interval]);

  return { data, loading, error };
}