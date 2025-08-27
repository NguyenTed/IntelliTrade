import { useEffect, useMemo, useRef } from "react";
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

type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

type Props = {
  symbol: string;
  interval: Interval;
  showEMA20: boolean;
  showSMA50: boolean;
  showVolume: boolean;
  chartType: ChartType;
  onHover?: (info: HoverInfo | null) => void;
};

function toUTC(date: Date): UTCTimestamp {
  return Math.floor(date.getTime() / 1000) as UTCTimestamp;
}

export default function LWChartContainer({
  symbol,
  interval,
  showEMA20,
  showSMA50,
  showVolume,
  chartType,
  onHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data, loading, error } = useMarketData(symbol, interval);

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
      timeScale: { borderColor: "#d1d5db" },
      crosshair: { mode: 1 },
    });

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
    } else if (chartType === "line") {
      mainSeries = chart.addSeries(LineSeries, { lineWidth: 2 });
      mainSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.close }))
      );
    } else if (chartType === "area") {
      mainSeries = chart.addSeries(AreaSeries, { lineWidth: 2 });
      mainSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.close }))
      );
    } else {
      // baseline
      const base = candles[candles.length - 1]?.close ?? 0;
      mainSeries = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: base },
      });
      mainSeries.setData(
        candles.map((c) => ({ time: c.time, value: c.close }))
      );
    }

    // Helper: emit hover info for a specific candle index
    const emitForIndex = (idx: number) => {
      if (idx < 0 || idx >= candles.length) {
        onHover?.(null);
        return;
      }
      const bar = candles[idx];
      const prevClose = idx > 0 ? candles[idx - 1].close : bar.close;
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

    const indexByTime = new Map<number, number>();
    for (let i = 0; i < candles.length; i++)
      indexByTime.set(Number(candles[i].time), i);

    const handleMove = (param: any) => {
      if (!param?.time) {
        emitForIndex(candles.length - 1);
        return;
      }
      const tNum = Number(param.time);
      const idx = indexByTime.get(tNum);
      if (idx === undefined) {
        emitForIndex(candles.length - 1);
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
      chart.remove();
    };
  }, [candles, chartType, showEMA20, showSMA50, showVolume, onHover]);

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
    <div className="w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ height: "100%" }}
      />
      {!candles?.length && (
        <div className="text-neutral-400 text-sm mt-2">
          No candles to display
        </div>
      )}
    </div>
  );
}
