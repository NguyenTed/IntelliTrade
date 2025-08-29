import { useEffect, useRef, useState } from "react";
import LayoutToggle, { type LayoutMode } from "./LayoutToggle";
import type { Interval } from "../store/chart.store";

// Local chart type union to mirror page-level state
type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

type Props = {
  activeSymbol?: string;
  activeSymbolImgs?: string[]; // optional: show current symbol icon(s)
  activeInterval?: Interval;
  layout: LayoutMode;
  onLayoutChange: (m: LayoutMode) => void;
  onRequestOpenSymbolModal?: () => void; // open symbol search modal

  // Header-level controls for the ACTIVE chart
  onChangeActiveInterval: (i: Interval) => void;
  indicatorState: { ema20: boolean; sma50: boolean; volume: boolean };
  onToggleIndicator: (k: "ema20" | "sma50" | "volume") => void;

  // Chart type control for the ACTIVE chart
  activeChartType: ChartType;
  onChangeActiveChartType: (t: ChartType) => void;
};

const FRAMES: Interval[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"];
const TYPES: ChartType[] = ["candles", "bars", "line", "area", "baseline"];

export default function AppHeader({
  activeSymbol,
  activeSymbolImgs,
  activeInterval,
  layout,
  onLayoutChange,
  onRequestOpenSymbolModal,
  onChangeActiveInterval,
  indicatorState,
  onToggleIndicator,
  activeChartType,
  onChangeActiveChartType,
}: Props) {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-4 px-4 pt-1 pb-3 bg-white/80 backdrop-blur">
      {/* Active chart label */}
      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 font-semibold shadow-sm"
          onClick={onRequestOpenSymbolModal}
          title="Change symbol"
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <SymbolAvatar imgs={activeSymbolImgs} symbol={activeSymbol} />
          <span className="tracking-wide">{activeSymbol ?? "—"}</span>
        </button>
        <span className="px-2 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs border border-neutral-200">
          {activeInterval ?? ("—" as any)}
        </span>
      </div>

      {/* Interval dropdown */}
      <Dropdown
        label={
          <>
            <IconClock />{" "}
            <span className="font-medium">{activeInterval ?? "—"}</span>
          </>
        }
      >
        <div className="grid grid-cols-4 gap-2 p-2 w-64">
          {FRAMES.map((f) => (
            <MenuButton
              key={f}
              active={activeInterval === f}
              onClick={() => onChangeActiveInterval(f)}
            >
              {f}
            </MenuButton>
          ))}
        </div>
      </Dropdown>

      {/* Indicators dropdown (multi-select) */}
      <Dropdown
        label={
          <>
            <IconBeaker /> <span className="font-medium">Indicators</span>
          </>
        }
      >
        <div className="flex flex-col p-2 min-w-[200px] gap-1">
          <CheckboxRow
            label="EMA20"
            checked={indicatorState.ema20}
            onChange={() => onToggleIndicator("ema20")}
          />
          <CheckboxRow
            label="SMA50"
            checked={indicatorState.sma50}
            onChange={() => onToggleIndicator("sma50")}
          />
          <CheckboxRow
            label="Volume"
            checked={indicatorState.volume}
            onChange={() => onToggleIndicator("volume")}
          />
        </div>
      </Dropdown>

      {/* Chart type dropdown */}
      <Dropdown
        label={
          <>
            <IconCandles />{" "}
            <span className="font-medium">{capitalize(activeChartType)}</span>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-2 p-2 w-64">
          {TYPES.map((t) => (
            <MenuButton
              key={t}
              active={activeChartType === t}
              onClick={() => onChangeActiveChartType(t)}
            >
              {capitalize(t)}
            </MenuButton>
          ))}
        </div>
      </Dropdown>

      {/* Layout dropdown */}
      <Dropdown
        label={
          <>
            <IconLayout /> <span className="font-medium">Layout</span>
          </>
        }
      >
        <div className="p-2">
          <LayoutToggle mode={layout} onChange={onLayoutChange} />
        </div>
      </Dropdown>
    </div>
  );
}

// --- UI primitives ---
function Dropdown({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-sm`}
      >
        <span className="inline-flex items-center gap-2">{label}</span>
        <IconChevronDown
          className={`transition ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 rounded-lg border border-neutral-200 bg-white shadow-xl ring-1 ring-black/5">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-sm border transition text-center truncate ${
        active
          ? "bg-neutral-100 text-neutral-900 border-neutral-300 shadow-inner"
          : "bg-white text-neutral-700 hover:text-neutral-900 border-neutral-200 hover:bg-neutral-50"
      }`}
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </button>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-50 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-sky-600"
      />
      <span className="text-sm text-neutral-800">{label}</span>
    </label>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SymbolAvatar({ imgs, symbol }: { imgs?: string[]; symbol?: string }) {
  if (imgs && imgs.length) {
    const urls = imgs.slice(0, 2);
    return (
      <span className="inline-flex -space-x-1">
        {urls.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={symbol ?? "symbol"}
            className="h-5 w-5 rounded-full ring-1 ring-neutral-300 bg-white object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ))}
      </span>
    );
  }
  // fallback: tag icon or letter badge
  if (symbol && symbol.length) {
    return (
      <span className="h-5 w-5 grid place-items-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-700 ring-1 ring-neutral-300">
        {symbol[0]}
      </span>
    );
  }
  return <IconTag className="opacity-80" />;
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function IconBeaker(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 2h12" />
      <path d="M9 2v4l-5 9a4 4 0 004 6h8a4 4 0 004-6l-5-9V2" />
    </svg>
  );
}
function IconCandles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3v18M6 7h4v8H6z" />
      <path d="M14 3v18M14 5h4v12h-4z" />
    </svg>
  );
}
function IconLayout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconTag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.59 13.41L12 22l-7.59-7.59A2 2 0 014 12V4h8a2 2 0 011.41.59l7.18 7.18a2 2 0 010 2.83z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}
