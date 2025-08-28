// src/features/chart/components/LeftToolBar.tsx
import { useDrawingStore } from "../store/drawing.store";

type Tool = "select" | "trendline" | "hline" | "ray" | "rect";

const TOOLS: { key: Tool; label: string }[] = [
  { key: "select", label: "Select" },
  { key: "trendline", label: "Trend" },
  { key: "hline", label: "H-Line" },
  { key: "ray", label: "Ray" },
  { key: "rect", label: "Rect" },
];

export default function LeftToolBar({ disabled }: { disabled?: boolean }) {
  const activeTool = useDrawingStore((s) => s.activeTool);
  const setActiveTool = useDrawingStore((s) => s.setActiveTool);

  return (
    <div className="flex flex-col gap-1 p-2 border-r bg-white/80">
      {TOOLS.map((t) => (
        <button
          key={t.key}
          disabled={disabled}
          onClick={() => setActiveTool(activeTool === t.key ? null : t.key)}
          className={[
            "px-2 py-1 rounded-md text-xs border shadow-sm",
            activeTool === t.key
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
            disabled ? "opacity-40 cursor-not-allowed" : "",
          ].join(" ")}
          title={t.label}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
