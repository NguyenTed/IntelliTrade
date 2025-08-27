export type HoverInfo = {
  time: number; // UTCTimestamp
  open: number;
  high: number;
  low: number;
  close: number;
  change?: number; // close - prevClose
  changePct?: number; // percent
};

export type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

function fmt(n: number | undefined, digits = 2) {
  if (n === undefined || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtSigned(n: number | undefined, digits = 2) {
  if (n === undefined || !Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return (
    sign +
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: digits,
    }).format(n)
  );
}

export default function InfoStrip({
  info,
  chartType = "candles",
  variant = "full", // "full" | "compact"
}: {
  info: HoverInfo | null;
  chartType?: ChartType;
  variant?: "full" | "compact";
}) {
  const neg = (info?.change ?? 0) < 0;
  const pos = (info?.change ?? 0) > 0;
  const color = neg
    ? "text-red-500"
    : pos
    ? "text-emerald-600"
    : "text-slate-600";

  if (variant === "compact") {
    const isOHLC = chartType === "candles" || chartType === "bars";
    return (
      <div className="inline-flex flex-nowrap items-center gap-2 text-[11px] sm:text-xs text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
        {isOHLC ? (
          <>
            <span className="inline-flex items-baseline gap-1">
              O <span className={color}>{fmt(info?.open, 2)}</span>
            </span>
            <span className="inline-flex items-baseline gap-1">
              H <span className={color}>{fmt(info?.high, 2)}</span>
            </span>
            <span className="inline-flex items-baseline gap-1">
              L <span className={color}>{fmt(info?.low, 2)}</span>
            </span>
            <span className="inline-flex items-baseline gap-1">
              C <span className={color}>{fmt(info?.close, 2)}</span>
            </span>
          </>
        ) : (
          // Line / Area / Baseline: show only Close + change
          <span className={color}>{fmt(info?.close, 2)}</span>
        )}
        {info &&
          Number.isFinite(info.change ?? NaN) &&
          Number.isFinite(info.changePct ?? NaN) && (
            <span className={color}>
              {fmtSigned(info.change, 2)} ({fmt(info.changePct, 2)}%)
            </span>
          )}
      </div>
    );
  }

  // existing “full” layout (desktop/toolbars). Switch content based on chart type
  const isOHLC = chartType === "candles" || chartType === "bars";
  return (
    <div className="inline-flex flex-nowrap items-center gap-6 text-sm select-none whitespace-nowrap overflow-hidden text-ellipsis">
      {isOHLC ? (
        <>
          <span className="inline-flex items-baseline gap-1 text-slate-600">
            O <span className={color}>{fmt(info?.open, 2)}</span>
          </span>
          <span className="inline-flex items-baseline gap-1 text-slate-600">
            H <span className={color}>{fmt(info?.high, 2)}</span>
          </span>
          <span className="inline-flex items-baseline gap-1 text-slate-600">
            L <span className={color}>{fmt(info?.low, 2)}</span>
          </span>
          <span className="inline-flex items-baseline gap-1 text-slate-600">
            C <span className={color}>{fmt(info?.close, 2)}</span>
          </span>
        </>
      ) : (
        <span className={`inline-flex items-baseline gap-1 ${color}`}>
          {fmt(info?.close, 2)}
        </span>
      )}
      {info &&
        Number.isFinite(info.change ?? NaN) &&
        Number.isFinite(info.changePct ?? NaN) && (
          <span className={`inline-flex items-baseline gap-1 ${color}`}>
            {fmtSigned(info.change, 2)} ({fmt(info.changePct, 2)}%)
          </span>
        )}
    </div>
  );
}
