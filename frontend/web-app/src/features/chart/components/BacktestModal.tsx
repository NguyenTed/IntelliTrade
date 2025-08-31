import { useEffect, useMemo, useState } from "react";
import type { Interval } from "../store/chart.store";
import type {
  BacktestRequest,
  Rule,
  IndicatorType,
  CompareOp,
} from "../types/backtest";

const INDICATORS: IndicatorType[] = ["SMA", "EMA"];
const OPS: CompareOp[] = [
  "Above",
  "Below",
  "AboveOrEqual",
  "BelowOrEqual",
  "Equal",
  "CrossesAbove",
  "CrossesBelow",
];
const INTERVALS: Interval[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"];

type Props = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  interval: Interval;
  defaultStart?: string; // ISO
  defaultEnd?: string; // ISO
  defaultLots?: number;
  defaultSlPct?: number;
  defaultTpPct?: number;
  defaultRules?: Rule[];
  defaultBuy?: string;
  defaultSell?: string;
  onSubmit: (req: BacktestRequest) => Promise<void> | void;
};

export default function BacktestModal({
  open,
  onClose,
  symbol,
  interval,
  defaultStart,
  defaultEnd,
  defaultLots = 10_000,
  defaultSlPct = 0.01,
  defaultTpPct = 0.02,
  defaultRules,
  defaultBuy = "s0",
  defaultSell = "s0",
  onSubmit,
}: Props) {
  const [startTime, setStartTime] = useState(defaultStart ?? isoDaysAgo(60));
  const [endTime, setEndTime] = useState(defaultEnd ?? isoNowHour());
  const [lots, setLots] = useState<number>(defaultLots);
  const [slPct, setSlPct] = useState<number>(defaultSlPct);
  const [tpPct, setTpPct] = useState<number>(defaultTpPct);
  const [selInterval, setSelInterval] = useState<Interval>(interval);
  const [rules, setRules] = useState<Rule[]>(
    defaultRules ?? [
      {
        left: { type: "SMA", window: 10 },
        op: "Above",
        right: { type: "SMA", window: 20 },
      },
    ]
  );
  const [buyCondition, setBuyCondition] = useState(defaultBuy);
  const [sellCondition, setSellCondition] = useState(defaultSell);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // reset potential transient errors when reopened
    setFormError(null);
  }, [open]);

  // --- Validation ---

  // start must be strictly before end
  const rangeError = useMemo(() => {
    if (!startTime || !endTime) return false;
    return new Date(startTime).getTime() >= new Date(endTime).getTime();
  }, [startTime, endTime]);

  const buyError = useMemo(
    () => validateLogic(buyCondition, rules.length),
    [buyCondition, rules.length]
  );
  const sellError = useMemo(
    () => validateLogic(sellCondition, rules.length),
    [sellCondition, rules.length]
  );

  const canSubmit = useMemo(() => {
    if (!symbol || !selInterval) return false;
    if (!startTime || !endTime) return false;
    if (rangeError) return false;
    if (!buyCondition || !sellCondition) return false;
    if (buyError || sellError) return false;
    if (lots <= 0 || slPct <= 0 || tpPct <= 0) return false;
    if (!rules.length) return false;
    return true;
  }, [
    symbol,
    selInterval,
    startTime,
    endTime,
    lots,
    slPct,
    tpPct,
    rules,
    rangeError,
    buyCondition,
    sellCondition,
    buyError,
    sellError,
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-[min(980px,95vw)] max-h-[92vh] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10 border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-center gap-3">
            <IconRocket className="text-sky-600" />
            <div className="text-lg font-semibold text-sky-700">
              Backtest — {symbol} · {selInterval}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Range */}
            <section className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h4 className="flex items-center gap-2 font-medium text-neutral-800 mb-3">
                <IconClock /> Time Range
              </h4>
              <div className="space-y-3">
                <Labeled>
                  <span className="text-sm text-neutral-700">Interval</span>
                  <select
                    className="input h-10 w-40"
                    value={selInterval}
                    onChange={(e) => setSelInterval(e.target.value as Interval)}
                  >
                    {INTERVALS.map((iv) => (
                      <option key={iv} value={iv}>
                        {iv}
                      </option>
                    ))}
                  </select>
                </Labeled>
                <Labeled>
                  <span className="text-sm text-neutral-700">Start</span>
                  <input
                    type="datetime-local"
                    className={`input h-10 ${
                      rangeError
                        ? "border-rose-400 ring-rose-200 focus:border-rose-500"
                        : ""
                    }`}
                    value={localInputValue(startTime)}
                    onChange={(e) =>
                      setStartTime(fromLocalInput(e.target.value))
                    }
                  />
                </Labeled>
                <Labeled>
                  <span className="text-sm text-neutral-700">End</span>
                  <input
                    type="datetime-local"
                    className={`input h-10 ${
                      rangeError
                        ? "border-rose-400 ring-rose-200 focus:border-rose-500"
                        : ""
                    }`}
                    value={localInputValue(endTime)}
                    onChange={(e) => setEndTime(fromLocalInput(e.target.value))}
                  />
                </Labeled>

                {rangeError && (
                  <p className="text-sm text-rose-600 mt-2">
                    Start must be <span className="font-medium">before</span>{" "}
                    End.
                  </p>
                )}
              </div>
            </section>

            {/* Strategy */}
            <section className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h4 className="flex items-center gap-2 font-medium text-neutral-800 mb-3">
                <IconBeaker /> Strategy
              </h4>
              <div className="space-y-3">
                <Labeled>
                  <span className="text-sm text-neutral-700">Lots (USD)</span>
                  <input
                    type="number"
                    className="input h-10"
                    min={1}
                    placeholder="e.g. 10000"
                    value={lots}
                    onChange={(e) => setLots(Number(e.target.value))}
                  />
                </Labeled>
                <Labeled>
                  <span className="text-sm text-neutral-700">SL (%)</span>
                  <input
                    type="number"
                    className="input h-10"
                    step="0.001"
                    min={0.0001}
                    placeholder="e.g. 0.50"
                    value={slPct}
                    onChange={(e) => setSlPct(Number(e.target.value))}
                  />
                </Labeled>
                <Labeled>
                  <span className="text-sm text-neutral-700">TP (%)</span>
                  <input
                    type="number"
                    className="input h-10"
                    step="0.001"
                    min={0.0001}
                    placeholder="e.g. 1.00"
                    value={tpPct}
                    onChange={(e) => setTpPct(Number(e.target.value))}
                  />
                </Labeled>
              </div>
            </section>

            {/* Rules */}
            <section className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 md:col-span-2">
              <h4 className="flex items-center gap-2 font-medium text-neutral-800 mb-3">
                <IconRule /> Rules
              </h4>
              <div className="space-y-3">
                {rules.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-md border border-neutral-200 bg-white"
                  >
                    <Select
                      value={r.left.type}
                      onChange={(v) =>
                        updateRule(idx, {
                          ...r,
                          left: { ...r.left, type: v as IndicatorType },
                        })
                      }
                      items={INDICATORS}
                    />
                    <input
                      type="number"
                      min={1}
                      className="input w-24 h-10"
                      value={r.left.window}
                      onChange={(e) =>
                        updateRule(idx, {
                          ...r,
                          left: { ...r.left, window: Number(e.target.value) },
                        })
                      }
                    />
                    <Select
                      value={r.op}
                      onChange={(v) =>
                        updateRule(idx, { ...r, op: v as CompareOp })
                      }
                      items={OPS}
                    />
                    <Select
                      value={r.right.type}
                      onChange={(v) =>
                        updateRule(idx, {
                          ...r,
                          right: { ...r.right, type: v as IndicatorType },
                        })
                      }
                      items={INDICATORS}
                    />
                    <input
                      type="number"
                      min={1}
                      className="input w-24 h-10"
                      value={r.right.window}
                      onChange={(e) =>
                        updateRule(idx, {
                          ...r,
                          right: { ...r.right, window: Number(e.target.value) },
                        })
                      }
                    />
                    <span className="ml-1 text-[11px] text-neutral-600 px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                      s{idx}
                    </span>
                    <div className="flex-1" />
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50 text-neutral-700"
                      onClick={() => removeRule(idx)}
                      title="Remove"
                    >
                      <IconTrash /> Remove
                    </button>
                  </div>
                ))}
                <button
                  className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800"
                  onClick={() => addRule()}
                >
                  + Add rule
                </button>
              </div>
            </section>

            {/* Conditions */}
            <section className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 md:col-span-2">
              <h4 className="flex items-center gap-2 font-medium text-neutral-800 mb-3">
                <IconLogic /> Conditions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-neutral-700 mb-2 block">
                    Buy condition
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {rules.map((_, i) => (
                      <Chip
                        key={i}
                        label={`s${i}`}
                        onClick={() => setBuyCondition((s) => s + `s${i}`)}
                      />
                    ))}
                    <Chip
                      label="("
                      onClick={() => setBuyCondition((s) => s + "(")}
                    />
                    <Chip
                      label=")"
                      onClick={() => setBuyCondition((s) => s + ")")}
                    />
                    <Chip
                      label="and"
                      onClick={() => setBuyCondition((s) => s + "&")}
                    />
                    <Chip
                      label="or"
                      onClick={() => setBuyCondition((s) => s + "|")}
                    />
                  </div>
                  <input
                    className={`input w-full h-10 ${
                      buyError
                        ? "border-rose-400 ring-rose-200 focus:border-rose-500"
                        : ""
                    }`}
                    value={buyCondition}
                    onChange={(e) => setBuyCondition(e.target.value)}
                  />
                  {buyError && (
                    <p className="text-sm text-rose-600 mt-2">{buyError}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-neutral-700 mb-2 block">
                    Sell condition
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {rules.map((_, i) => (
                      <Chip
                        key={i}
                        label={`s${i}`}
                        onClick={() => setSellCondition((s) => s + `s${i}`)}
                      />
                    ))}
                    <Chip
                      label="("
                      onClick={() => setSellCondition((s) => s + "(")}
                    />
                    <Chip
                      label=")"
                      onClick={() => setSellCondition((s) => s + ")")}
                    />
                    <Chip
                      label="and"
                      onClick={() => setSellCondition((s) => s + "&")}
                    />
                    <Chip
                      label="or"
                      onClick={() => setSellCondition((s) => s + "|")}
                    />
                  </div>
                  <input
                    className={`input w-full h-10 ${
                      sellError
                        ? "border-rose-400 ring-rose-200 focus:border-rose-500"
                        : ""
                    }`}
                    value={sellCondition}
                    onChange={(e) => setSellCondition(e.target.value)}
                  />
                  {sellError && (
                    <p className="text-sm text-rose-600 mt-2">{sellError}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {formError ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">
              {formError}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-neutral-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border bg-white hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="px-3 py-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Running…
              </span>
            ) : (
              "Run Backtest"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  function addRule() {
    setRules((r) =>
      r.concat({
        left: { type: "SMA", window: 10 },
        op: "Above",
        right: { type: "SMA", window: 20 },
      })
    );
  }
  function removeRule(idx: number) {
    setRules((r) => r.filter((_, i) => i !== idx));
    // NOTE: user must adjust s-index references if they delete rows
  }
  function updateRule(idx: number, next: Rule) {
    setRules((r) => r.map((it, i) => (i === idx ? next : it)));
  }

  async function handleSubmit() {
    if (!canSubmit || buyError || sellError || rangeError) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const req: BacktestRequest = {
        symbol,
        interval: selInterval,
        lots,
        slPct,
        tpPct,
        rules,
        buyCondition,
        sellCondition,
        startTime,
        endTime,
      };
      await Promise.resolve(onSubmit(req));
    } catch (e: any) {
      setFormError(e?.message ?? "Failed to run backtest");
    } finally {
      setSubmitting(false);
    }
  }
}

function Labeled({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3">
      {children}
    </label>
  );
}

function Select({
  value,
  items,
  onChange,
}: {
  value: string;
  items: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="input h-10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {items.map((it) => (
        <option key={it} value={it}>
          {it}
        </option>
      ))}
    </select>
  );
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-0.5 text-xs rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 shadow-sm"
    >
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
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
function IconRocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        d="M5 15l-1 4 4-1 9-9a3 3 0 10-4-4L4 14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7l2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconBeaker(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path d="M6 2h12" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 2v4l-5 9a4 4 0 004 6h8a4 4 0 004-6l-5-9V2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
function IconRule(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        d="M4 6h16M4 12h10M4 18h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconLogic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        d="M4 12h8m0 0a4 4 0 108 0 4 4 0 10-8 0z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 19);
}
function isoNowHour() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 19);
}
/** convert stored ISO to local input-friendly format */
function localInputValue(iso: string) {
  // "YYYY-MM-DDTHH:mm:ss" -> "YYYY-MM-DDTHH:mm"
  return iso.slice(0, 16);
}
function fromLocalInput(v: string) {
  // "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00"
  return v.length === 16 ? v + ":00" : v;
}

/**
 * Validate a condition expression like: s0 & (s1 | s2)
 * - Accept both textual 'and'/'or' and symbols '&'/'|'
 * - Ensure balanced parentheses
 * - Ensure correct token order (operand/operator)
 * - Ensure referenced sN are within [0, ruleCount-1]
 * Returns null if valid, or a human-friendly error string.
 */
function validateLogic(cond: string, ruleCount: number): string | null {
  if (!cond || !cond.trim()) return "Condition is empty";
  // normalize textual operators to symbols for validation
  const normalized = cond
    .replace(/\band\b/gi, "&")
    .replace(/\bor\b/gi, "|")
    .replace(/\s+/g, " ")
    .trim();

  // tokenize: sN, &, |, (, )
  const re = /s\d+|[&|()]|\S+/g;
  const raw = normalized.match(re) || [];
  const tokens = raw.filter((t) => t.trim().length > 0);

  let depth = 0;
  let expectOperand = true;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (expectOperand) {
      if (t === "(") {
        depth++;
        continue;
      }
      if (/^s\d+$/.test(t)) {
        const idx = Number(t.slice(1));
        if (!Number.isInteger(idx) || idx < 0 || idx >= ruleCount) {
          return `Unknown signal ${t}`;
        }
        expectOperand = false;
        continue;
      }
      return "Expected a signal (e.g. s0) or '('";
    } else {
      if (t === "&" || t === "|") {
        expectOperand = true;
        continue;
      }
      if (t === ")") {
        if (depth <= 0) return "Unmatched ')'";
        depth--;
        continue;
      }
      return "Expected 'and'/'or' or ')'";
    }
  }

  if (expectOperand) return "Expression ends with an operator";
  if (depth !== 0) return "Unmatched '('";
  return null;
}
