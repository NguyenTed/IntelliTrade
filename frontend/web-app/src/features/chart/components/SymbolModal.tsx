// src/features/chart/components/SymbolModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchSymbols, type MarketSymbol } from "../api/market";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (symbol: string) => void; // returns symbol name, e.g. "BTCUSDT"
};

export default function SymbolModal({ open, onClose, onPick }: Props) {
  const [all, setAll] = useState<MarketSymbol[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0); // keyboard highlight
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchSymbols()
      .then(setAll)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return all;
    return all.filter((s) => {
      if (s.name.toLowerCase().includes(qq)) return true;
      if (s.description?.toLowerCase().includes(qq)) return true;
      return false;
    });
  }, [q, all]);

  useEffect(() => {
    // reset highlight when list changes
    setIdx(0);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!filtered.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const hit = filtered[idx];
        if (hit) {
          onPick(hit.name);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, idx, onPick, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-[101] w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-slate-200">
        {/* Header / Search */}
        <div className="p-4 border-b border-slate-200">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search symbols… (e.g. BTC, ETH, XRP)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-slate-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-slate-500">No matches.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((s, i) => (
                <li
                  key={s.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                    i === idx ? "bg-sky-50" : "hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => {
                    onPick(s.name);
                    onClose();
                  }}
                >
                  <div className="flex -space-x-1">
                    {(s.symbolImgs ?? []).slice(0, 2).map((src, k) => (
                      <img
                        key={k}
                        src={src}
                        alt={s.name}
                        className="h-6 w-6 rounded-full ring-1 ring-slate-200 bg-white object-contain"
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 font-medium truncate">
                      {s.name}
                    </div>
                    <div className="text-slate-500 text-sm truncate">
                      {s.description}
                    </div>
                  </div>
                  <button
                    className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPick(s.name);
                      onClose();
                    }}
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 flex items-center justify-between text-xs text-slate-500">
          <span>↑/↓ to navigate • Enter to select • Esc to close</span>
          <button
            className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
