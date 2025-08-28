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
    let timer: number | null = null;
    let pending: (Candle & { isFinal: boolean }) | null = null;

    const flush = () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer != null) window.clearTimeout(timer);
      raf = 0;
      timer = null;
      const p = pending;
      pending = null;
      if (p) onBarRef.current(p);
    };

    const schedule = () => {
      // Use rAF when visible; fall back to a timer when hidden so updates still flow
      if (document.hidden) {
        if (timer == null) timer = window.setTimeout(flush, 150);
      } else if (!raf) {
        raf = requestAnimationFrame(flush);
      }
    };

    const handle = (u: Candle & { isFinal: boolean }) => {
      if ((window as any).__log_rt__ !== false) {
        console.debug("[RT] msg", { symbol, interval, u });
      }
      pending = u;
      schedule();
    };

    const onVis = () => {
      // When returning to the tab, apply the latest pending update immediately
      if (!document.hidden) flush();
    };
    document.addEventListener("visibilitychange", onVis);

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
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
      try {
        unsub && unsub();
      } catch {}
      if ((window as any).__log_rt__ !== false) {
        console.debug("[RT] left", { symbol, interval });
      }
    };
  }, [symbol, interval]);
}