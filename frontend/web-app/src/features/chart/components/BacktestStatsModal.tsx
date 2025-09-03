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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[min(960px,95vw)] max-h-[90vh] rounded-2xl bg-white shadow-[0_12px_40px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b bg-gradient-to-r from-sky-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconGauge className="text-sky-600" />
            <div>
              <div className="text-lg font-semibold text-neutral-900">
                Backtest Statistics
              </div>
              <div className="text-[12px] text-neutral-500">
                Clean snapshot of performance, risk & timing
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-grid place-items-center h-8 w-8 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        {/* Summary band */}
        {stats && (
          <div className="px-5 py-4 border-b bg-white/60">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryKPI
                label="Return"
                value={fmtSignedPct(stats.return_pct)}
                intent={colorIntent(stats.return_pct)}
              />
              <SummaryKPI
                label="Win Rate"
                value={fmtPct(stats.win_rate)}
                intent={colorIntent(stats.win_rate)}
              />
              <SummaryKPI
                label="Trades"
                value={fmtInt(stats.trades_count)}
                intent="neutral"
              />
              <SummaryKPI
                label="Max Drawdown"
                value={fmtSignedPct(stats.max_drawdown_pct)}
                intent={colorIntent(-Math.abs(stats.max_drawdown_pct))}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {!stats ? (
            <div className="p-6 text-sm text-neutral-600">
              No stats available
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Performance Overview */}
              <Section title="Performance" first>
                <GridList>
                  <StatItem
                    label="Return"
                    value={fmtSignedPct(stats.return_pct)}
                    intent={colorIntent(stats.return_pct)}
                  />
                  <StatItem
                    label="Buy & Hold"
                    value={fmtSignedPct(stats.buy_hold_return_pct)}
                    intent={colorIntent(stats.buy_hold_return_pct)}
                  />
                  <StatItem
                    label="Annual Return"
                    value={fmtSignedPct(stats.return_ann_pct)}
                    intent={colorIntent(stats.return_ann_pct)}
                  />
                  <StatItem
                    label="Volatility (ann)"
                    value={fmtPct(stats.volatility_ann_pct)}
                  />
                  <StatItem
                    label="Sharpe"
                    value={fmtNumber(stats.sharpe_ratio)}
                    intent={ratioIntent(stats.sharpe_ratio)}
                  />
                  <StatItem
                    label="Sortino"
                    value={fmtNumber(stats.sortino_ratio)}
                    intent={ratioIntent(stats.sortino_ratio)}
                  />
                  <StatItem
                    label="SQN"
                    value={fmtNumber(stats.sqn)}
                    intent={ratioIntent(stats.sqn)}
                  />
                  <StatItem
                    label="Win Rate"
                    value={fmtPct(stats.win_rate)}
                    intent={colorIntent(stats.win_rate)}
                  />
                </GridList>
              </Section>

              {/* Risk */}
              <Section title="Risk">
                <GridList>
                  <StatItem
                    label="Max Drawdown"
                    value={fmtSignedPct(stats.max_drawdown_pct)}
                    intent={colorIntent(-Math.abs(stats.max_drawdown_pct))}
                  />
                  <StatItem
                    label="Avg Drawdown"
                    value={fmtSignedPct(stats.avg_drawdown_pct)}
                    intent={colorIntent(-Math.abs(stats.avg_drawdown_pct))}
                  />
                  <StatItem
                    label="Equity Peak (USD)"
                    value={fmtNumber(stats.equity_peak_usd)}
                  />
                  <StatItem
                    label="Equity Final (USD)"
                    value={fmtNumber(stats.equity_final_usd)}
                    intent={colorIntent(
                      stats.equity_final_usd - stats.equity_peak_usd
                    )}
                  />
                  <StatItem
                    label="Exposure Time"
                    value={fmtPct(stats.exposure_time_pct)}
                  />
                </GridList>
              </Section>

              {/* Timing */}
              <Section title="Timing">
                <GridList>
                  <StatItem label="Duration" value={stats.duration} />
                  <StatItem label="Start" value={stats.start} />
                  <StatItem label="End" value={stats.end} />
                  <StatItem
                    label="Avg Trade Duration"
                    value={stats.avg_trade_duration}
                  />
                  <StatItem
                    label="Max Trade Duration"
                    value={stats.max_trade_duration}
                  />
                  <StatItem
                    label="Avg Trade %"
                    value={fmtSignedPct(stats.avg_trade_pct)}
                    intent={colorIntent(stats.avg_trade_pct)}
                  />
                  <StatItem
                    label="Expectancy %"
                    value={fmtSignedPct(stats.expectancy_pct)}
                    intent={colorIntent(stats.expectancy_pct)}
                  />
                </GridList>
              </Section>

              {/* Trades */}
              <Section title="Trades">
                <GridList>
                  <StatItem
                    label="Trades Count"
                    value={fmtInt(stats.trades_count)}
                  />
                  <StatItem
                    label="Best Trade"
                    value={fmtSignedPct(stats.best_trade)}
                    intent={colorIntent(stats.best_trade)}
                  />
                  <StatItem
                    label="Worst Trade"
                    value={fmtSignedPct(stats.worst_trade)}
                    intent={colorIntent(stats.worst_trade)}
                  />
                  <StatItem
                    label="Max DD Duration"
                    value={stats.max_drawdown_duration}
                  />
                  <StatItem
                    label="Avg DD Duration"
                    value={stats.avg_drawdown_duration}
                  />
                </GridList>
              </Section>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t bg-neutral-50 flex items-center justify-end">
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

function Section({
  title,
  children,
  first,
}: {
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={`${first ? "" : "pt-4 mt-2 border-t border-neutral-200"}`}
    >
      <h4 className="text-[12px] font-semibold text-neutral-600 tracking-wide uppercase mb-2">
        {title}
      </h4>
      {children}
    </section>
  );
}

function fmtInt(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat().format(n);
}
function fmtNumber(n: number | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    n
  );
}
function fmtPct(x: number | undefined) {
  if (x == null || !Number.isFinite(x)) return "—";
  const abs = Math.abs(x);
  const looksLikeFraction = abs <= 1 && abs >= 0; // tolerate 0..1 or already %
  const v = looksLikeFraction ? x * 100 : x;
  return `${v.toFixed(2)}%`;
}
function fmtSignedPct(x: number | undefined) {
  if (x == null || !Number.isFinite(x)) return "—";
  const abs = Math.abs(x);
  const looksLikeFraction = abs <= 1 && abs >= 0;
  const v = looksLikeFraction ? x * 100 : x;
  const sign = v > 0 ? "+" : v < 0 ? "" : "";
  return `${sign}${v.toFixed(2)}%`;
}
function colorIntent(v: number | undefined): "good" | "bad" | "neutral" {
  if (v == null || !Number.isFinite(v)) return "neutral";
  return v >= 0 ? "good" : "bad";
}
function ratioIntent(v: number | undefined): "good" | "bad" | "neutral" {
  if (v == null || !Number.isFinite(v)) return "neutral";
  if (v > 0) return "good";
  if (v < 0) return "bad";
  return "neutral";
}

function GridList({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">{children}</div>
  );
}

function StatItem({
  label,
  value,
  intent,
}: {
  label: string;
  value: React.ReactNode;
  intent?: "good" | "bad" | "neutral";
}) {
  const tone =
    intent === "good"
      ? "text-emerald-700"
      : intent === "bad"
      ? "text-rose-700"
      : "text-neutral-900";
  return (
    <div className="flex items-baseline gap-2 py-1.5 text-sm">
      <div className="min-w-[160px] text-neutral-500">{label}</div>
      <div className="flex-1 border-b border-dotted border-neutral-300/60" />
      <div className={`font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

function SummaryKPI({
  label,
  value,
  intent,
}: {
  label: string;
  value: React.ReactNode;
  intent?: "good" | "bad" | "neutral";
}) {
  const tone =
    intent === "good"
      ? "text-emerald-700"
      : intent === "bad"
      ? "text-rose-700"
      : "text-neutral-900";
  return (
    <div className="rounded-lg ring-1 ring-neutral-200 bg-white p-3">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div
        className={`text-xl leading-tight font-semibold tabular-nums ${tone}`}
      >
        {value}
      </div>
    </div>
  );
}

function IconClose(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        d="M6 6l12 12M18 6l-12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconGauge(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 12l4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
