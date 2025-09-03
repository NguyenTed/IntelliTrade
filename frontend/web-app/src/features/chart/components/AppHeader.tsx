import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { type LayoutMode } from "./LayoutToggle";
import type { Interval } from "../store/chart.store";
import type { PanelPrediction } from "../types/prediction";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import { authStore } from "@/features/auth/model/authStore";

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

  onRequestOpenBacktest?: () => void;

  // Right sidebar controls
  onToggleRightSidebar?: () => void;
  rightSidebarOpen?: boolean;

  onRequestUpgrade?: (
    feature: "BACKTEST" | "MULTI_CHARTS" | "INDICATORS"
  ) => void;
};

const FRAMES: Interval[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"];
const TYPES: ChartType[] = ["candles", "bars", "line", "area", "baseline"];

function IconCrystalBall(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="10" r="6" />
      <path d="M6 18h12" />
      <path d="M8 22h8" />
    </svg>
  );
}
function IconSpinner(props: React.SVGProps<SVGSVGElement>) {
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
      className={(props.className ?? "") + " animate-spin"}
    >
      <path d="M12 2a10 10 0 100 20" opacity="0.2" />
      <path d="M12 2a10 10 0 010 4" />
    </svg>
  );
}

function IconUserCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 1 1 14 0H5Z" />
    </svg>
  );
}
function IconHome(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 11l9-8 9 8" />
      <path d="M5 12v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}
function IconProfile(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </svg>
  );
}

function UserMenu() {
  const user = authStore((s) => s.user);

  // If no logged-in user, render a Home button that links to "/"
  if (!user) {
    return (
      <Link to="/" aria-label="Go to home" className="inline-flex items-center">
        <span className="rounded-full p-[3px] bg-gradient-to-br from-sky-300 via-emerald-300 to-indigo-300 shadow transition">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-white text-neutral-800 shadow-md ring-1 ring-neutral-200 transition-transform duration-150 ease-out hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <span className="relative inline-grid place-items-center">
              <IconHome className="h-6 w-6" />
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.9),transparent_55%)]"
                aria-hidden
              />
            </span>
          </span>
        </span>
      </Link>
    );
  }

  // Logged-in: show the user dropdown
  return (
    <Dropdown
      showCaret={false}
      buttonClassName="p-0 rounded-full border-0 bg-transparent shadow-none hover:bg-transparent"
      menuClassName="absolute z-50 mt-2 w-44 rounded-xl border border-neutral-200 bg-white shadow-xl ring-1 ring-black/5"
      label={
        <span className="inline-flex items-center">
          <span className="rounded-full p-[3px] bg-gradient-to-br from-sky-300 via-emerald-300 to-indigo-300 shadow transition">
            <span
              className="grid place-items-center h-9 w-9 rounded-full bg-white text-neutral-800 shadow-md ring-1 ring-neutral-200 transition-transform duration-150 ease-out hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label="User menu"
            >
              <span className="relative inline-grid place-items-center">
                <IconUserCircle className="h-7 w-7" />
                <span
                  className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.9),transparent_55%)]"
                  aria-hidden
                />
              </span>
            </span>
          </span>
        </span>
      }
    >
      <div className="p-2 space-y-1">
        <MenuLink to="/" icon={<IconHome />}>
          Home
        </MenuLink>
        <MenuLink to="/profile" icon={<IconProfile />}>
          Profile
        </MenuLink>
      </div>
    </Dropdown>
  );
}

function MenuLink({
  to,
  children,
  icon,
}: {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition text-left truncate bg-transparent text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
    >
      {icon ? <span className="shrink-0 text-[1rem]">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </Link>
  );
}

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
  onRequestOpenBacktest,
  onRequestUpgrade,
  onToggleRightSidebar,
  rightSidebarOpen,
}: Props) {
  const user = authStore((s) => s.user);
  const isPremium = !!user?.premium;

  const handleBacktestClick = () => {
    if (!user || !isPremium) {
      onRequestUpgrade?.("BACKTEST");
      return;
    }
    onRequestOpenBacktest?.();
  };

  const handleLayoutChange = (m: LayoutMode) => {
    const requiresPremium = m !== "1"; // any layout other than single is premium
    if (requiresPremium && (!user || !isPremium)) {
      onRequestUpgrade?.("MULTI_CHARTS");
      return;
    }
    onLayoutChange(m);
  };

  const handleToggleIndicator = (k: "ema20" | "sma50" | "volume") => {
    if (!user || !isPremium) {
      onRequestUpgrade?.("INDICATORS");
      return;
    }
    onToggleIndicator(k);
  };

  return (
    <div className="sticky top-0 z-40 flex items-center gap-4 px-4 pt-1 pb-3 bg-white/80 backdrop-blur">
      {/* Active chart label */}
      <div className="mr-1.5">
        <UserMenu />
      </div>
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
        <div className="p-2 w-24 space-y-1">
          {FRAMES.map((f) => (
            <MenuButton
              key={f}
              active={activeInterval === f}
              icon={frameIcon(f)}
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
        <div className="flex flex-col p-2 w-33 gap-1">
          <CheckboxRow
            label="EMA20"
            checked={indicatorState.ema20}
            onChange={() => handleToggleIndicator("ema20")}
            className={!isPremium ? "opacity-70" : undefined}
          />
          <CheckboxRow
            label="SMA50"
            checked={indicatorState.sma50}
            onChange={() => handleToggleIndicator("sma50")}
            className={!isPremium ? "opacity-70" : undefined}
          />
          <CheckboxRow
            label="Volume"
            checked={indicatorState.volume}
            onChange={() => handleToggleIndicator("volume")}
            className={!isPremium ? "opacity-70" : undefined}
          />
        </div>
      </Dropdown>

      {/* Chart type dropdown (one column with icons) */}
      <Dropdown
        label={
          <>
            <IconCandles />{" "}
            <span className="font-medium">{capitalize(activeChartType)}</span>
          </>
        }
      >
        <div className="p-2 w-31 space-y-1">
          <MenuButton
            active={activeChartType === "candles"}
            icon={<IconCandles />}
            onClick={() => onChangeActiveChartType("candles")}
          >
            Candles
          </MenuButton>
          <MenuButton
            active={activeChartType === "bars"}
            icon={<IconBars />}
            onClick={() => onChangeActiveChartType("bars")}
          >
            Bars
          </MenuButton>
          <MenuButton
            active={activeChartType === "line"}
            icon={<IconLine />}
            onClick={() => onChangeActiveChartType("line")}
          >
            Line
          </MenuButton>
          <MenuButton
            active={activeChartType === "area"}
            icon={<IconArea />}
            onClick={() => onChangeActiveChartType("area")}
          >
            Area
          </MenuButton>
          <MenuButton
            active={activeChartType === "baseline"}
            icon={<IconBaseline />}
            onClick={() => onChangeActiveChartType("baseline")}
          >
            Baseline
          </MenuButton>
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
        <div className="p-2 w-52 space-y-1">
          <MenuButton
            active={layout === "1"}
            icon={<IconLayout1 />}
            onClick={() => handleLayoutChange("1")}
          >
            Single
          </MenuButton>
          <MenuButton
            active={layout === "2v"}
            icon={<IconLayout2v />}
            onClick={() => handleLayoutChange("2v")}
          >
            2-Up (Vertical){!isPremium ? <PremiumBadge /> : null}
          </MenuButton>
          <MenuButton
            active={layout === "2h"}
            icon={<IconLayout2h />}
            onClick={() => handleLayoutChange("2h")}
          >
            2-Up (Horizontal){!isPremium ? <PremiumBadge /> : null}
          </MenuButton>
          <MenuButton
            active={layout === "3h"}
            icon={<IconLayout3h />}
            onClick={() => handleLayoutChange("3h")}
          >
            3-Up (Row){!isPremium ? <PremiumBadge /> : null}
          </MenuButton>
          <MenuButton
            active={layout === "3v"}
            icon={<IconLayout3v />}
            onClick={() => handleLayoutChange("3v")}
          >
            3-Up (Column){!isPremium ? <PremiumBadge /> : null}
          </MenuButton>
          <MenuButton
            active={layout === "4"}
            icon={<IconLayout4 />}
            onClick={() => handleLayoutChange("4")}
          >
            2 × 2 Grid{!isPremium ? <PremiumBadge /> : null}
          </MenuButton>
        </div>
      </Dropdown>

      {/* Backtest trigger */}
      <button
        onClick={handleBacktestClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-sm"
        title="Run backtest on active chart"
      >
        <IconPlay className="shrink-0" />
        Backtest
      </button>
      {/* Right sidebar toggle button, aligned to far right */}
      <div className="ml-auto">
        <button
          onClick={onToggleRightSidebar}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
            rightSidebarOpen
              ? "bg-neutral-100 border-neutral-400 text-neutral-900"
              : "bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-50"
          } shadow-sm`}
          title={rightSidebarOpen ? "Hide side panel" : "Show side panel"}
        >
          <NewspaperIcon />
        </button>
      </div>
    </div>
  );
}

// --- UI primitives ---
function Dropdown({
  label,
  children,
  buttonClassName,
  menuClassName,
  showCaret = true,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  buttonClassName?: string;
  menuClassName?: string;
  showCaret?: boolean;
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
        className={
          buttonClassName ??
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-sm"
        }
      >
        <span className="inline-flex items-center gap-2">{label}</span>
        {showCaret ? (
          <IconChevronDown
            className={`transition ${open ? "rotate-180" : "rotate-0"}`}
          />
        ) : null}
      </button>
      {open && (
        <div
          className={
            menuClassName ??
            "absolute z-50 mt-2 rounded-lg border border-neutral-200 bg-white shadow-xl ring-1 ring-black/5"
          }
        >
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
  icon,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm border transition text-left truncate ${
        active
          ? "bg-neutral-100 text-neutral-900 border-neutral-300 shadow-inner"
          : "bg-white text-neutral-700 hover:text-neutral-900 border-neutral-200 hover:bg-neutral-50"
      }`}
      title={typeof children === "string" ? children : undefined}
    >
      {icon ? <span className="shrink-0 text-[1rem]">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <label
      className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-50 cursor-pointer ${
        className ?? ""
      }`}
    >
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

/* New icons for chart types */
function IconBars(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M6 4v16M10 8v8M14 5v14M18 7v10" />
    </svg>
  );
}
function IconLine(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 17l6-6 4 3 7-8" />
    </svg>
  );
}
function IconArea(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 17h18" />
      <path
        d="M3 17l6-6 4 3 8-9v12H3z"
        fill="currentColor"
        opacity="0.15"
        stroke="none"
      />
      <path d="M3 17l6-6 4 3 8-9" />
    </svg>
  );
}
function IconBaseline(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 15h18" />
      <path d="M3 15l5-5 4 2 6-7" />
    </svg>
  );
}
function IconLayout1(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
function IconLayout2v(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="4" width="8" height="16" rx="1" />
      <rect x="13" y="4" width="8" height="16" rx="1" />
    </svg>
  );
}
function IconLayout2h(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="4" y="3" width="16" height="8" rx="1" />
      <rect x="4" y="13" width="16" height="8" rx="1" />
    </svg>
  );
}
function IconLayout3h(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="2.5" y="4" width="6.5" height="16" rx="1" />
      <rect x="9.25" y="4" width="6.5" height="16" rx="1" />
      <rect x="16" y="4" width="6.5" height="16" rx="1" />
    </svg>
  );
}
function IconLayout3v(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="4" y="2.5" width="16" height="6.5" rx="1" />
      <rect x="4" y="9.25" width="16" height="6.5" rx="1" />
      <rect x="4" y="16" width="16" height="6.5" rx="1" />
    </svg>
  );
}
function IconLayout4(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function IconTimeMin(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 12l4-2" />
      <path d="M12 7v5" />
    </svg>
  );
}
function IconTimeHour(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 12l3 2" />
      <path d="M12 6v6" />
    </svg>
  );
}
function IconTimeDay(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}
function IconTimeWeek(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 9v11" />
      <path d="M16 9v11" />
    </svg>
  );
}
function IconTimeMonth(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M7 13h10" />
      <path d="M7 17h6" />
    </svg>
  );
}

function frameIcon(f: Interval) {
  if (f === "1m" || f === "5m" || f === "15m") return <IconTimeMin />;
  if (f === "1h" || f === "4h") return <IconTimeHour />;
  if (f === "1d") return <IconTimeDay />;
  if (f === "1w") return <IconTimeWeek />;
  return <IconTimeMonth />; // 1M
}

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPanelRight(props: React.SVGProps<SVGSVGElement>) {
  // A simple "panel right" icon: left rectangle + right panel
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
      <rect x="3" y="4" width="14" height="16" rx="2" />
      <rect
        x="17"
        y="4"
        width="4"
        height="16"
        rx="1"
        fill="currentColor"
        opacity="0.15"
        stroke="none"
      />
      <rect x="17" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function PredictionChip({ p }: { p: PanelPrediction }) {
  const sign = p.delta >= 0 ? "+" : "";
  const color =
    p.trend === "UP"
      ? "text-green-600"
      : p.trend === "DOWN"
      ? "text-red-500"
      : "text-slate-500";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border border-neutral-200 bg-white shadow-sm ${color}`}
      title={`Predicted: ${p.predicted.toLocaleString()} | Latest: ${p.latest.toLocaleString()}`}
    >
      Pred {p.predicted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      <span className="text-[11px]">
        ({sign}
        {p.deltaPct.toFixed(2)}%)
      </span>
    </span>
  );
}

function PremiumBadge() {
  return (
    <span
      className="ml-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50/70 px-1.5 py-[2px] leading-none"
      title="Premium feature"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 text-amber-600"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5 17h14l1-9-5 3-3-6-3 6-5-3 1 9zm-1 2a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2H4z" />
      </svg>
      <span className="sr-only">Premium</span>
    </span>
  );
}
