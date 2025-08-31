type ChartType = "candles" | "bars" | "line" | "area" | "baseline";
import React, { useEffect, useRef, useState } from "react";
import InfoStrip, { type HoverInfo } from "./InfoStrip";
import LWChartContainer from "./LWChartContainer";
import type { Interval } from "../store/chart.store";
import type { BacktestTrade } from "../types/backtest";
import type { PanelPrediction } from "../types/prediction";
import { fetchPrediction } from "../api/prediction";

/**
 * ChartPanel: a single chart cell that is fully controlled by its parent.
 * - No internal symbol input toolbar anymore.
 * - Shows an overlay in the top-left: SYMBOL | timeframe shortcuts | InfoStrip
 * - Click anywhere on the panel to make it the active chart (parent highlights it)
 */
export default function ChartPanel({
  id,
  active,
  symbol,
  interval,
  chartType,
  onActivate,
  onChangeSymbol,
  onChangeInterval,
  // indicator flags can be made per-panel later; default to true for now
  showEMA20 = false,
  showSMA50 = false,
  showVolume = false,
  backtestTrades,
  prediction,
}: {
  id: number;
  active: boolean;
  symbol: string;
  interval: Interval;
  chartType: ChartType;
  onActivate: (id: number) => void;
  onChangeSymbol: (id: number, s: string) => void;
  onChangeInterval: (id: number, i: Interval) => void;
  showEMA20?: boolean;
  showSMA50?: boolean;
  showVolume?: boolean;
  backtestTrades?: BacktestTrade[];
  prediction?: PanelPrediction | null;
}) {
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const [localPrediction, setLocalPrediction] =
    useState<PanelPrediction | null>(null);
  const lastFetchRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // helper: ms until the next bar boundary based on interval string
  function msUntilNextBar(iv: Interval) {
    const now = new Date();
    const ms = now.getTime();
    const sec = 1000;
    const min = 60 * sec;
    const hour = 60 * min;
    const day = 24 * hour;

    const ivMap: Record<string, number | "1d" | "1w" | "1M"> = {
      "1m": min,
      "5m": 5 * min,
      "15m": 15 * min,
      "1h": hour,
      "4h": 4 * hour,
      "1d": "1d",
      "1w": "1w",
      "1M": "1M",
    };
    const slot = ivMap[iv] ?? min;

    if (slot === "1d") {
      const next = new Date(now);
      next.setUTCHours(0, 0, 0, 0);
      next.setUTCDate(next.getUTCDate() + 1);
      return next.getTime() - ms;
    }
    if (slot === "1w") {
      // assume weeks start on Monday (ISO). Get next Monday 00:00 UTC
      const d = new Date(now);
      const dayIdx = (d.getUTCDay() + 6) % 7; // 0..6 for Mon..Sun
      const daysToNextMon = (7 - dayIdx) % 7 || 7;
      const next = new Date(
        Date.UTC(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate() + daysToNextMon,
          0,
          0,
          0,
          0
        )
      );
      return next.getTime() - ms;
    }
    if (slot === "1M") {
      // first day of next month 00:00 UTC
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth();
      const next = new Date(
        Date.UTC(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, 1, 0, 0, 0, 0)
      );
      return next.getTime() - ms;
    }

    // minute/hour slots: align to slot boundary from epoch
    const period = slot as number;
    const nextMs = Math.ceil(ms / period) * period;
    return Math.max(500, nextMs - ms + 50); // small buffer
  }

  async function loadPrediction(label: string) {
    try {
      const res = await fetchPrediction({ symbol, interval });
      setLocalPrediction({
        symbol: res.symbol,
        interval: interval,
        latest: res.latest_close_price,
        predicted: res.predicted_close_price,
        trend: res.trend as any,
        delta: res.predicted_close_price - res.latest_close_price,
        deltaPct: res.latest_close_price
          ? ((res.predicted_close_price - res.latest_close_price) /
              res.latest_close_price) *
            100
          : 0,
      });
      lastFetchRef.current = Date.now();
      // schedule next fetch on new bar boundary
      const wait = msUntilNextBar(interval);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => loadPrediction("timer"), wait);
    } catch (e) {
      // optionally keep previous prediction; reschedule anyway
      const wait = Math.max(5_000, msUntilNextBar(interval));
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => loadPrediction("retry"), wait);
    }
  }

  // fetch immediately on mount/symbol/interval change
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    loadPrediction("init");
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [symbol, interval]);

  // refresh when tab becomes visible and a bar likely rolled
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastFetchRef.current;
        if (elapsed > 2000) {
          loadPrediction("visibility");
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      className={`relative h-full rounded-2xl overflow-hidden border bg-white 
        ${
          active
            ? "border-sky-400 shadow-[0_0_0_2px_rgba(56,189,248,0.25)]"
            : "border-neutral-200"
        }`}
      onMouseDown={() => onActivate(id)}
      title={active ? "Active chart" : "Click to activate this chart"}
    >
      {/* Top-left overlay: symbol/interval and InfoStrip stacked */}
      <div className="absolute z-10 top-2 left-2 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded bg-white/85 text-neutral-800 text-xs font-medium shadow border border-neutral-200"
            title="Symbol"
          >
            {symbol}
          </span>
          <span
            className="px-2 py-0.5 rounded bg-white/85 text-neutral-600 text-[11px] shadow border border-neutral-200"
            title="Interval"
          >
            {interval}
          </span>
          {(prediction ?? localPrediction) && (
            <span
              className={`px-2 py-0.5 rounded bg-white/85 text-xs font-medium shadow border border-neutral-200 ${
                (prediction ?? localPrediction)!.trend === "UP"
                  ? "text-green-600"
                  : (prediction ?? localPrediction)!.trend === "DOWN"
                  ? "text-red-600"
                  : "text-neutral-600"
              }`}
              title="Predicted close"
            >
              Close price predicted:{" "}
              {(prediction ?? localPrediction)!.predicted.toFixed(2)} (
              {(prediction ?? localPrediction)!.delta >= 0 ? "+" : ""}
              {(prediction ?? localPrediction)!.deltaPct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="px-2 py-1 rounded bg-white/85 shadow border border-neutral-200 max-w-[65vw] sm:max-w-[45vw] md:max-w-[32vw]">
          <div className="[transform:scale(0.92)] origin-left sm:[transform:scale(1)]">
            <InfoStrip info={hover} variant="compact" chartType={chartType} />
          </div>
        </div>
      </div>

      {/* Chart canvas fills the whole panel */}
      <div className="absolute inset-0">
        <LWChartContainer
          chartId={id}
          symbol={symbol}
          interval={interval}
          chartType={chartType}
          showEMA20={showEMA20}
          showSMA50={showSMA50}
          showVolume={showVolume}
          onHover={setHover}
          editable={active}
          backtestTrades={backtestTrades}
          onNewBar={(t) => loadPrediction("newbar")}
        />
      </div>
    </div>
  );
}
