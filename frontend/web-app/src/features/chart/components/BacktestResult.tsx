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
    <div className="w-full bg-white">
      {/* Small header bar for actions */}
      <div className="px-4 py-2.5 flex items-center justify-between text-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="text-neutral-600">
          Trades{" "}
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full border border-neutral-300 text-neutral-800 bg-white/70 text-[12px] font-medium">
            {trades.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800"
            onClick={onOpenStats}
            disabled={!stats}
            title={stats ? "View stats" : "No stats"}
          >
            View stats
          </button>
          <button
            className="px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800"
            onClick={onClose}
            title="Hide results"
          >
            Close
          </button>
        </div>
      </div>

      {/* Scrollable table (about ~5 rows) with sticky header */}
      <div className="px-3 pb-3">
        <div className="overflow-auto ring-1 ring-neutral-200/80 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.15)] max-h-64">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
              <tr className="[&>th]:px-3 [&>th]:py-3 text-left text-neutral-500 font-bold tracking-wider uppercase text-[11px]">
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Entry Bar</th>
                <th>Exit Bar</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Size</th>
                <th>Return %</th>
                <th>SL</th>
                <th>TP</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => {
                const ret = Number((t as any).ReturnPct ?? 0);
                const isWin = Number.isFinite(ret) && ret >= 0;
                const entryBar = safeNum((t as any).EntryBar);
                const exitBar = safeNum((t as any).ExitBar);
                const entryPrice = safeNum(t.EntryPrice);
                const exitPrice = safeNum(t.ExitPrice);
                const size = safeNum((t as any).Size);
                const sl = safeNum((t as any).SL);
                const tp = safeNum((t as any).TP);

                return (
                  <tr
                    key={i}
                    className={`border-t [&>td]:px-3 [&>td]:py-2 font-medium align-middle bg-neutral-50 hover:bg-neutral-100 ${
                      isWin ? "text-emerald-700" : "text-rose-700"
                    } ${
                      isWin
                        ? "border-l-2 border-l-emerald-400"
                        : "border-l-2 border-l-rose-400"
                    }`}
                  >
                    <td className="font-mono text-[13px]">{t.EntryTime}</td>
                    <td className="font-mono text-[13px]">{t.ExitTime}</td>
                    <td className="tabular-nums font-mono">
                      {entryBar !== null ? entryBar : "—"}
                    </td>
                    <td className="tabular-nums font-mono">
                      {exitBar !== null ? exitBar : "—"}
                    </td>
                    <td className="tabular-nums font-mono">
                      {entryPrice !== null ? fmtNumber(entryPrice) : "—"}
                    </td>
                    <td className="tabular-nums font-mono">
                      {exitPrice !== null ? fmtNumber(exitPrice) : "—"}
                    </td>
                    <td className="tabular-nums font-mono">
                      {size !== null ? fmtNumber(size) : "—"}
                    </td>
                    <td className="tabular-nums font-mono">
                      <span className="inline-flex items-center gap-1">
                        {isWin ? <IconUp /> : <IconDown />}
                        {fmtSignedPct(ret)}
                      </span>
                    </td>
                    <td className="tabular-nums font-mono text-right">
                      {sl !== null ? fmtNumber(sl) : "—"}
                    </td>
                    <td className="tabular-nums font-mono text-right">
                      {tp !== null ? fmtNumber(tp) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* no stats cards inline */}
      </div>
    </div>
  );
}

function fmtSignedPct(x: number) {
  const abs = Math.abs(x);
  const looksLikeFraction = abs <= 1 && abs >= 0;
  const v = looksLikeFraction ? x * 100 : x;
  const sign = v > 0 ? "+" : v < 0 ? "" : ""; // explicit + for positives
  return `${sign}${v.toFixed(2)}%`;
}

function IconUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      <path d="M12 4l6 6h-4v10h-4V10H6l6-6z" />
    </svg>
  );
}
function IconDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      <path d="M12 20l-6-6h4V4h4v10h4l-6 6z" />
    </svg>
  );
}

function fmtNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
    n ?? 0
  );
}

function safeNum(n: any): number | null {
  if (typeof n === "number" && Number.isFinite(n)) return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
