import { useEffect, useRef } from "react";
import type { Interval, Candle } from "../types/market";
import { realtimeClient } from "../api/realtimeClient";

export function useRealtimeBars(
  symbol: string,
  interval: Interval,
  onBar: (u: Candle & { isFinal: boolean }) => void
) {
  const onBarRef = useRef(onBar);
  onBarRef.current = onBar;

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let raf = 0;
    let pending: (Candle & { isFinal: boolean }) | null = null;

    const handle = (u: Candle & { isFinal: boolean }) => {
      // Debug: log incoming messages (toggle off by setting window.__log_rt__ = false)
      if ((window as any).__log_rt__ !== false) {
        console.debug("[RT] msg", { symbol, interval, u });
      }
      // throttle to animation frame to avoid spamming chart updates
      pending = u;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          const p = pending;
          pending = null;
          if (p) onBarRef.current(p);
        });
      }
    };

    (async () => {
      try {
        if ((window as any).__log_rt__ !== false) {
          console.debug("[RT] join->", { symbol, interval });
        }
        unsub = await realtimeClient.join(symbol, interval, handle);
        if ((window as any).__log_rt__ !== false) {
          console.debug("[RT] joined", { symbol, interval, ok: !!unsub });
        }
      } catch (err: any) {
        console.error("[RT] join error", err?.message ?? err);
      }
    })();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      try {
        unsub && unsub();
      } catch {}
      if ((window as any).__log_rt__ !== false) {
        console.debug("[RT] left", { symbol, interval });
      }
    };
  }, [symbol, interval]);
}