// src/features/chart/components/LeftToolBar.tsx
import { useDrawingStore } from "../store/drawing.store";
import type { Tool } from "../types/drawing";

const TOOLS: { key: Tool | "select" | "deleteAll"; label: string }[] = [
  { key: "select", label: "Select" },
  { key: "trendline", label: "Trend" },
  { key: "hline", label: "H-Line" },
  { key: "ray", label: "Ray" },
  { key: "rect", label: "Rect" },
  { key: "vline", label: "V-Line" },
  { key: "text", label: "Text" },
  { key: "range", label: "Range" },
  { key: "channel", label: "Channel" },
  { key: "fib", label: "Fib" },
  { key: "ellipse", label: "Ellipse" },
  { key: "arrow", label: "Arrow" },
  { key: "brush", label: "Brush" },
  { key: "deleteAll", label: "Delete All" },
];

export default function LeftToolBar({ disabled }: { disabled?: boolean }) {
  const activeTool = useDrawingStore((s) => s.activeTool);
  const setActiveTool = useDrawingStore((s) => s.setActiveTool);

  return (
    <div className="flex flex-col gap-1 p-2 border-r bg-white/80 select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setActiveTool(null)}
        className={[
          "px-2 py-1 rounded-md text-xs border shadow-sm",
          activeTool == null
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
          disabled ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
        title="None"
      >
        None
      </button>
      {TOOLS.map((t) => (
        <button
          key={t.key}
          disabled={disabled}
          onClick={() => setActiveTool(activeTool === t.key ? null : t.key)}
          className={[
            "px-2 py-1 rounded-md text-xs border shadow-sm",
            activeTool === t.key
              ? "bg-slate-900 text-white border-slate-900"
              : t.key === "deleteAll"
              ? "bg-white text-red-600 border-slate-200 hover:bg-red-50"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
            disabled ? "opacity-40 cursor-not-allowed" : "",
          ].join(" ")}
          title={t.label}
          aria-label={t.label}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
