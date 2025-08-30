import type { BacktestResponse } from "../types/backtest";

type Props = {
  data: BacktestResponse | string | null;
  onOpenStats?: () => void;
  onClose?: () => void; // NEW
};

export default function BacktestResults({ data, onOpenStats, onClose }: Props) {
  let parsed: BacktestResponse | null = null;

  if (data) {
    if (typeof data === "string") {
      try {
        const safe = data
          .replace(/\bNaN\b/g, "null")
          .replace(/\b-Infinity\b/g, "null")
          .replace(/\bInfinity\b/g, "null");
        parsed = JSON.parse(safe) as BacktestResponse;
      } catch {
        return (
          <div className="p-4 text-sm text-rose-600">
            Failed to parse backtest data
          </div>
        );
      }
    }
    if (parsed === null && typeof data === "object") {
      parsed = data as any;
    }
  }

  const stats = parsed?.stats ?? null;
  const trades = parsed?.trades ?? null;

  if (!trades) {
    return (
      <div className="px-4 py-3 text-sm text-neutral-600 border-t bg-white">
        No trades returned
      </div>
    );
  }

  return (
    <div className="w-full border-t bg-white">
      {/* Small header bar for actions */}
      <div className="px-3 py-2 flex items-center justify-between text-sm">
        <div className="text-neutral-600">
          Trades: <span className="font-medium">{trades.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2.5 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800"
            onClick={onOpenStats}
            disabled={!stats}
            title={stats ? "View stats" : "No stats"}
          >
            View stats
          </button>
          <button
            className="px-2.5 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800"
            onClick={onClose}
            title="Hide results"
          >
            Close
          </button>
        </div>
      </div>

      {/* Scrollable table (about ~5 rows) with sticky header */}
      <div className="px-3 pb-3">
        <div className="overflow-auto border rounded max-h-64">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>EntryTime</th>
                <th>ExitTime</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Return %</th>
                <th>Size</th>
                <th>SL</th>
                <th>TP</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={i} className="border-t [&>td]:px-3 [&>td]:py-1.5">
                  <td className="tabular-nums">{t.EntryTime}</td>
                  <td className="tabular-nums">{t.ExitTime}</td>
                  <td className="tabular-nums">{fmtNumber(t.EntryPrice)}</td>
                  <td className="tabular-nums">{fmtNumber(t.ExitPrice)}</td>
                  <td
                    className={`tabular-nums ${
                      (t as any).ReturnPct >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {fmtPct((t as any).ReturnPct)}
                  </td>
                  <td className="tabular-nums">{fmtNumber((t as any).Size)}</td>
                  <td className="tabular-nums">{fmtNumber((t as any).SL)}</td>
                  <td className="tabular-nums">{fmtNumber((t as any).TP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* no stats cards inline */}
      </div>
    </div>
  );
}

/** Formats percent that may be fraction (0.36) or already percent (36). */
function fmtPct(x: number) {
  const abs = Math.abs(x);
  const looksLikeFraction = abs <= 1 && abs >= 0;
  const v = looksLikeFraction ? x * 100 : x;
  return `${v.toFixed(2)}%`;
}

function fmtNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
    n ?? 0
  );
}
