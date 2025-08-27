type ChartType = "candles" | "bars" | "line" | "area" | "baseline";
import React, { useState } from "react";
import InfoStrip, { type HoverInfo } from "./InfoStrip";
import LWChartContainer from "./LWChartContainer";
import type { Interval } from "../store/chart.store";

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
}) {
  const [hover, setHover] = useState<HoverInfo | null>(null);

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
          symbol={symbol}
          interval={interval}
          chartType={chartType}
          showEMA20={showEMA20}
          showSMA50={showSMA50}
          showVolume={showVolume}
          onHover={setHover}
        />
      </div>
    </div>
  );
}
