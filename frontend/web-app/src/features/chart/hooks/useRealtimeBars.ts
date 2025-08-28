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
      // throttle to animation frame
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
      unsub = await realtimeClient.join(symbol, interval, handle);
    })();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (unsub) unsub();
    };
  }, [symbol, interval]);
}