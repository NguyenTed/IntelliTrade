import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  BaselineSeries,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { HoverInfo } from "./InfoStrip";
import type { Interval } from "../store/chart.store";
import { useMarketData } from "../hooks/useMarketData";
import DrawingLayer from "./DrawingLayer";
import type { ChartProjector } from "../types/drawing";
import { useRealtimeBars } from "../hooks/useRealtimeBars";
// IMPORTANT: use the Capital-T path to match the actual file name

type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

type Props = {
  symbol: string;
  interval: Interval;
  showEMA20: boolean;
  showSMA50: boolean;
  showVolume: boolean;
  chartType: ChartType;
  onHover?: (info: HoverInfo | null) => void;
  editable?: boolean;
};

function toUTC(date: Date): UTCTimestamp {
  return Math.floor(date.getTime() / 1000) as UTCTimestamp;
}

function toSec(ts: unknown): number {
  if (typeof ts === "number") {
    // If looks like ms epoch (> 1e12), convert to seconds
    return ts > 1_000_000_000_000 ? Math.floor(ts / 1000) : ts;
  }
  if (typeof ts === "string") {
    const d = Date.parse(ts);
    if (!Number.isNaN(d)) return Math.floor(d / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

export default function LWChartContainer({
  symbol,
  interval,
  showEMA20,
  showSMA50,
  showVolume,
  chartType,
  onHover,
  editable = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const candlesRef = useRef(
    [] as {
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }[]
  );
  const indexByTimeRef = useRef<Map<number, number>>(new Map());
  const projectorRef = useRef<ChartProjector | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const autoFollowRef = useRef(true);
  const [projectorReady, setProjectorReady] = useState(false);
  const { data, loading, error } = useMarketData(symbol, interval);

  // Debug: confirm this container mounts for the current panel
  useEffect(() => {
    try {
      console.debug("[RT] container mount", { symbol, interval, chartType });
    } catch {}
  }, [symbol, interval, chartType]);

  const candles = useMemo(
    () =>
      data?.map((d) => ({
        time: toUTC(d.date),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      })) ?? null,
    [data]
  );

  useEffect(() => {
    if (!containerRef.current || !candles) return;

    console.debug("LWChartContainer mount", {
      w: containerRef.current.clientWidth,
      h: containerRef.current.clientHeight,
      candles: candles.length,
    });

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#1f2937", // slate-800
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#e5e7eb" }, // tailwind gray-200
        horzLines: { color: "#e5e7eb" },
      },
      rightPriceScale: { borderColor: "#d1d5db" }, // gray-300
      leftPriceScale: { borderColor: "#d1d5db" },
      timeScale: {
        borderColor: "#d1d5db",
        // Do NOT auto-shift view when a new bar comes in; we'll do it manually when at right edge
        shiftVisibleRangeOnNewBar: false,
      },
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;

    // Track whether we are at (or near) the right edge to auto-follow new bars
    const ts = chart.timeScale();
    const updateAutoFollow = () => {
      // Follow only when the right offset is effectively 0 (at the last bar).
      const getRO = (ts as any).getRightOffset
        ? (ts as any).getRightOffset.bind(ts)
        : null;
      if (!getRO) {
        autoFollowRef.current = true;
        return;
      }
      const ro = Number(getRO());
      // If user scrolls left (history) -> ro > 0; if user scrolls right (future) -> ro < 0.
      // In both cases, do NOT auto-follow. Only follow when near 0.
      autoFollowRef.current = ro > -0.25 && ro < 0.25;
    };
    ts.subscribeVisibleLogicalRangeChange(updateAutoFollow as any);
    // Initialize follow state
    try {
      updateAutoFollow();
    } catch {}

    // Projector bridges time/price <-> pixel coords and exposes a subscribe hook
    projectorRef.current = {
      timeToX: (t: number) =>
        chart.timeScale().timeToCoordinate(t as any) ?? null,
      xToTime: (x: number) => {
        const lt = chart.timeScale().coordinateToTime(x);
        return lt != null ? (Number(lt) as number) : null;
      },
      priceToY: (p: number) =>
        mainSeriesRef.current?.priceToCoordinate(p) ?? null,
      yToPrice: (y: number) =>
        mainSeriesRef.current?.coordinateToPrice(y) ?? null,
      subscribe: (cb: () => void) => {
        const ts = chart.timeScale();
        const onRange = cb as any;
        const onSize = cb as any;
        ts.subscribeVisibleLogicalRangeChange(onRange);
        ts.subscribeSizeChange(onSize);
        const ro = new ResizeObserver(() => cb());
        if (containerRef.current) ro.observe(containerRef.current);
        return () => {
          try {
            ts.unsubscribeVisibleLogicalRangeChange(onRange);
          } catch {}
          try {
            ts.unsubscribeSizeChange(onSize);
          } catch {}
          try {
            ro.disconnect();
          } catch {}
        };
      },
    };

    let mainSeries: ISeriesApi<any>;
    if (chartType === "candles") {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
      mainSeriesRef.current = mainSeries;
      candlesRef.current = candles.map((c) => ({ ...c }));
      setProjectorReady(true);
    } else if (chartType === "bars") {
      mainSeries = chart.addSeries(BarSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
      mainSeriesRef.current = mainSeries;
      candlesRef.current = candles.map((c) => ({ ...c }));
      setProjectorReady(true);
    } else if (chartType === "line") {
      mainSeries = chart.addSeries(LineSeries, { lineWidth: 2 });
      mainSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.close }))
      );
      mainSeriesRef.current = mainSeries;
      candlesRef.current = candles.map((c) => ({ ...c }));
      setProjectorReady(true);
    } else if (chartType === "area") {
      mainSeries = chart.addSeries(AreaSeries, { lineWidth: 2 });
      mainSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.close }))
      );
      mainSeriesRef.current = mainSeries;
      candlesRef.current = candles.map((c) => ({ ...c }));
      setProjectorReady(true);
    } else {
      // baseline
      const base = candles[candles.length - 1]?.close ?? 0;
      mainSeries = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: base },
      });
      mainSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.close }))
      );
      mainSeriesRef.current = mainSeries;
      candlesRef.current = candles.map((c) => ({ ...c }));
      setProjectorReady(true);
    }

    // Debug: initial series ready
    try {
      const last = candlesRef.current?.[candlesRef.current.length - 1];
      console.debug("[RT] series ready", {
        type: chartType,
        lastTime: last?.time,
        symbol,
        interval,
      });
    } catch {}

    // Helper: emit hover info for a specific candle index
    const emitForIndex = (idx: number) => {
      const arr = candlesRef.current;
      if (!arr.length || idx < 0 || idx >= arr.length) {
        onHover?.(null);
        return;
      }
      const bar = arr[idx];
      const prevClose = idx > 0 ? arr[idx - 1].close : bar.close;
      const change = bar.close - prevClose;
      const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      onHover?.({
        time: Number(bar.time),
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        change,
        changePct,
      });
    };

    // Initialize the info strip with the LAST candle
    emitForIndex(candles.length - 1);

    const initialIndexByTime = new Map<number, number>();
    for (let i = 0; i < candles.length; i++) {
      initialIndexByTime.set(Number(candles[i].time), i);
    }
    indexByTimeRef.current = initialIndexByTime;

    const handleMove = (param: any) => {
      if (!param?.time) {
        const n = candlesRef.current.length;
        emitForIndex(n - 1);
        return;
      }
      const tNum = Number(param.time);
      const idx = indexByTimeRef.current.get(tNum);
      if (idx === undefined) {
        const n = candlesRef.current.length;
        emitForIndex(n - 1);
        return;
      }
      emitForIndex(idx);
    };
    chart.subscribeCrosshairMove(handleMove);

    // Optional volume as histogram in same pane (left scale).
    // v5: addSeries(HistogramSeries, options)
    let volumeSeries: ISeriesApi<"Histogram"> | null = null;
    if (showVolume) {
      // Configure the LEFT price scale margins to push the histogram to the bottom of the main pane
      chart.priceScale("left").applyOptions({
        scaleMargins: { top: 0.75, bottom: 0.02 },
        borderColor: "#334155",
      });

      volumeSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: "left",
        priceFormat: { type: "volume" },
        color: "#64748b",
      });
      volumeSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.volume }))
      );
      volumeSeriesRef.current = volumeSeries;
    }

    // Simple EMA/SMA overlays (computed locally)
    function movingAverage(
      values: number[],
      window: number,
      exponential = false
    ) {
      const out: (number | undefined)[] = [];
      let sum = 0,
        k = exponential ? 2 / (window + 1) : 0,
        prevEma = 0;
      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        sum += v;
        if (i < window - 1) {
          out.push(undefined);
          continue;
        }
        if (i === window - 1) {
          const sma = sum / window;
          out.push(sma);
          prevEma = sma;
          continue;
        }
        if (exponential) {
          prevEma = v * k + prevEma * (1 - k);
          out.push(prevEma);
        } else {
          sum -= values[i - window + 1];
          out.push(sum / window);
        }
      }
      return out;
    }
    const closes = candles.map((c) => c.close);

    if (showEMA20) {
      const ema20 = movingAverage(closes, 20, true);
      const emaSeries = chart.addSeries(LineSeries, {
        color: "#22d3ee",
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
      });
      const emaData = candles.map((c, i) => {
        const v = ema20[i];
        return v === undefined || Number.isNaN(v)
          ? ({ time: c.time } as any) // whitespace point to create a gap
          : ({ time: c.time, value: v } as any);
      });
      emaSeries.setData(emaData);
    }
    if (showSMA50) {
      const sma50 = movingAverage(closes, 50, false);
      const smaSeries = chart.addSeries(LineSeries, {
        color: "#a78bfa",
        lineWidth: 2,
      });
      const smaData = candles.map((c, i) => {
        const v = sma50[i];
        return v === undefined || Number.isNaN(v)
          ? ({ time: c.time } as any)
          : ({ time: c.time, value: v } as any);
      });
      smaSeries.setData(smaData);
    }

    // Keep responsive
    const ro = new ResizeObserver(() => chart.applyOptions({}));
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.unsubscribeCrosshairMove(handleMove);
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      projectorRef.current = null;
      setProjectorReady(false);
      // clear chart ref
      chartRef.current = null;
      try {
        chart
          .timeScale()
          .unsubscribeVisibleLogicalRangeChange(updateAutoFollow as any);
      } catch {}
      chart.remove();
    };
  }, [
    candles,
    chartType,
    showEMA20,
    showSMA50,
    showVolume,
    onHover,
    symbol,
    interval,
  ]);

  // Realtime updates
  useRealtimeBars(symbol, interval, (u) => {
    const main = mainSeriesRef.current;
    if (!main) return;
    // Capture right offset BEFORE we mutate data/series so we know where the user was
    const ts0 = chartRef.current?.timeScale();
    const roBefore =
      ts0 && (ts0 as any).getRightOffset
        ? Number((ts0 as any).getRightOffset())
        : 0;
    const lrBefore = ts0?.getVisibleLogicalRange?.();

    // Debug one-liner to verify updates are received by this container
    try {
      console.debug("[RT] container got", { symbol, interval, bar: u });
    } catch {}

    // Normalize server time to seconds
    const t = toSec((u as any).time);

    const arr = candlesRef.current;
    const lastIdx = arr.length - 1;
    const last = lastIdx >= 0 ? arr[lastIdx] : undefined;

    const nextBar = {
      time: t,
      open: u.open,
      high: u.high,
      low: u.low,
      close: u.close,
      volume: u.volume ?? last?.volume ?? 0,
    };

    const sameBar = !!last && Number(last.time) === t;

    if (sameBar) {
      // replace last
      arr[lastIdx] = nextBar;
    } else if (!last || t > Number(last.time)) {
      // append new
      arr.push(nextBar);
      indexByTimeRef.current.set(t, arr.length - 1);
    } else {
      // out-of-order -> ignore
      return;
    }

    // Update main price series according to chart type
    switch (chartType) {
      case "candles":
      case "bars": {
        (main as any).update({
          time: t,
          open: nextBar.open,
          high: nextBar.high,
          low: nextBar.low,
          close: nextBar.close,
        });
        break;
      }
      case "line":
      case "area":
      case "baseline": {
        (main as any).update({ time: t, value: nextBar.close });
        break;
      }
      default:
        break;
    }

    // Volume update if enabled
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.update({
        time: t as any,
        value: nextBar.volume,
      } as any);
    }

    // Update InfoStrip with the latest bar (when not hovering)
    if (onHover) {
      const idx = arr.length - 1;
      const prevClose = idx > 0 ? arr[idx - 1].close : arr[idx].close;
      const change = arr[idx].close - prevClose;
      const changePct = prevClose ? (change / prevClose) * 100 : 0;
      onHover({
        time: t,
        open: arr[idx].open,
        high: arr[idx].high,
        low: arr[idx].low,
        close: arr[idx].close,
        change,
        changePct,
      });
    }

    // Keep chart scrolled to the latest bar ONLY when a new bar was appended
    // and only if the user was actually at/right-near the edge BEFORE the update.
    if (!sameBar) {
      if (roBefore >= 0 && roBefore < 0.25) {
        chartRef.current?.timeScale().scrollToRealTime?.();
      }
    }
    // If user was NOT at the right edge (past or future) and a NEW bar was appended,
    // shift the previous logical range by +1 so the viewport stays visually fixed.
    if (!sameBar && lrBefore && (roBefore <= -0.25 || roBefore >= 0.25)) {
      try {
        const from = (lrBefore as any).from ?? (lrBefore as any).left;
        const to = (lrBefore as any).to ?? (lrBefore as any).right;
        (ts0 as any)?.setVisibleLogicalRange?.({ from: from + 1, to: to + 1 });
      } catch {}
    }
  });

  // Expose a tiny helper so you can test updates from DevTools:
  // __rt_tick({ time: Math.floor(Date.now()/1000), open: 1, high: 2, low: 0.5, close: 1.5, volume: 10, isFinal: false })
  try {
    (window as any).__rt_tick = (bar: any) => {
      const cb = (u: any) => {
        // Run through the same path as realtime
        const main = mainSeriesRef.current;
        if (!main) return;
        // Capture right offset BEFORE we mutate data/series so we know where the user was
        const ts0 = chartRef.current?.timeScale();
        const roBefore =
          ts0 && (ts0 as any).getRightOffset
            ? Number((ts0 as any).getRightOffset())
            : 0;
        const lrBefore = ts0?.getVisibleLogicalRange?.();
        const t = toSec((u as any).time);
        const arr = candlesRef.current;
        const lastIdx = arr.length - 1;
        const last = lastIdx >= 0 ? arr[lastIdx] : undefined;
        const nextBar = {
          time: t,
          open: u.open,
          high: u.high,
          low: u.low,
          close: u.close,
          volume: u.volume ?? last?.volume ?? 0,
        };
        const sameBar = !!last && Number(last.time) === t;
        if (sameBar) arr[lastIdx] = nextBar;
        else if (!last || t > Number(last.time)) {
          arr.push(nextBar);
          indexByTimeRef.current.set(t, arr.length - 1);
        } else return;

        switch (chartType) {
          case "candles":
          case "bars":
            (main as any).update({
              time: t,
              open: nextBar.open,
              high: nextBar.high,
              low: nextBar.low,
              close: nextBar.close,
            });
            break;
          default:
            (main as any).update({ time: t, value: nextBar.close });
            break;
        }
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.update({
            time: t as any,
            value: nextBar.volume,
          } as any);
        }
        // Keep chart scrolled to the latest bar ONLY when a new bar was appended
        // and only if the user was actually at/right-near the edge BEFORE the update.
        if (!sameBar) {
          if (roBefore >= 0 && roBefore < 0.25) {
            chartRef.current?.timeScale().scrollToRealTime?.();
          }
        }
        // If user was NOT at the right edge (past or future) and a NEW bar was appended,
        // shift the previous logical range by +1 so the viewport stays visually fixed.
        if (!sameBar && lrBefore && (roBefore <= -0.25 || roBefore >= 0.25)) {
          try {
            const from = (lrBefore as any).from ?? (lrBefore as any).left;
            const to = (lrBefore as any).to ?? (lrBefore as any).right;
            (ts0 as any)?.setVisibleLogicalRange?.({
              from: from + 1,
              to: to + 1,
            });
          } catch {}
        }
      };
      console.debug("[RT] __rt_tick", bar);
      cb(bar);
    };
  } catch {}

  if (loading)
    return (
      <div className="w-full h-full grid place-items-center text-neutral-400">
        Loading…
      </div>
    );
  if (error)
    return (
      <div className="w-full h-full grid place-items-center text-red-500">
        {error}
      </div>
    );
  return (
    <div className="w-full h-full relative">
      {/* relative so overlays can absolutely position */}
      {/* Chart container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ height: "100%" }}
      />

      {/* Drawing overlay (only when projector is ready) */}
      {projectorReady && projectorRef.current && (
        <DrawingLayer
          symbol={symbol}
          interval={interval}
          projector={projectorRef.current}
          editable={editable}
        />
      )}

      {!candles?.length && (
        <div className="text-neutral-400 text-sm mt-2">
          No candles to display
        </div>
      )}
    </div>
  );
}
