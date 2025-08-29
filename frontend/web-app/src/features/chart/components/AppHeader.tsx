import { useEffect, useRef, useState } from "react";
import LayoutToggle, { type LayoutMode } from "./LayoutToggle";
import type { Interval } from "../store/chart.store";

// Local chart type union to mirror page-level state
type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

type Props = {
  activeSymbol?: string;
  activeInterval?: Interval;
  layout: LayoutMode;
  onLayoutChange: (m: LayoutMode) => void;
  onRequestChangeSymbol: () => void; // will open a modal later

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
  activeInterval,
  layout,
  onLayoutChange,
  onRequestChangeSymbol,
  onChangeActiveInterval,
  indicatorState,
  onToggleIndicator,
  activeChartType,
  onChangeActiveChartType,
}: Props) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white">
      {/* Active chart label */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium"
          onClick={onRequestChangeSymbol}
          title="Change symbol"
        >
          {activeSymbol ?? "—"}
        </button>
        <span className="px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-sm">
          {activeInterval ?? ("—" as any)}
        </span>
      </div>

      {/* Interval dropdown */}
      <Dropdown label={`Interval: ${activeInterval ?? "—"}`}>
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
      <Dropdown label="Indicators">
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
      <Dropdown label={`Type: ${capitalize(activeChartType)}`}>
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
      <Dropdown label="Layout">
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
  label: string;
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
        className={`px-3 py-1.5 rounded-lg border text-sm bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800`}
      >
        {label}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 rounded-lg border border-neutral-200 bg-white shadow-lg">
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
      className={`px-2 py-1.5 rounded-md text-sm border transition text-center truncate ${
        active
          ? "bg-neutral-200 text-neutral-900 border-neutral-300"
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
