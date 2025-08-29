import type { BacktestStats } from "../types/backtest";

export default function BacktestStatsModal({
  open,
  onClose,
  stats,
}: {
  open: boolean;
  onClose: () => void;
  stats: BacktestStats | null;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[min(720px,92vw)] rounded-xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-lg font-semibold">Backtest Stats</div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-neutral-600 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        {!stats ? (
          <div className="p-4 text-sm text-neutral-600">No stats available</div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat k="Return %" v={fmtPct(stats.return_pct)} />
            <Stat k="Win rate" v={fmtPct(stats.win_rate)} />
            <Stat k="Max DD" v={fmtPct(stats.max_drawdown)} />
            <Stat k="Trades" v={String(stats.trades_count)} />
            <Stat k="Best trade" v={fmtPct(stats.best_trade)} />
            <Stat k="Worst trade" v={fmtPct(stats.worst_trade)} />
            <Stat k="Equity Final" v={fmtNumber(stats.equity_final)} />
            <Stat k="Equity Peak" v={fmtNumber(stats.equity_peak)} />
            <Stat k="Exposure %" v={fmtPct(stats.exposure_time)} />
            <Stat k="Duration" v={stats.duration} />
            <Stat k="Start" v={stats.start} />
            <Stat k="End" v={stats.end} />
          </div>
        )}

        <div className="px-4 py-3 border-t flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border bg-white hover:bg-neutral-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="text-xs text-neutral-500">{k}</div>
      <div className="text-sm font-semibold tabular-nums">{v}</div>
    </div>
  );
}

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
