// src/features/chart/components/LeftToolBar.tsx
import { useDrawingStore } from "../store/drawing.store";
import type { Tool } from "../types/drawing";
import { AiOutlineArrowRight } from "react-icons/ai";
import { BiText } from "react-icons/bi";
import { FaMousePointer, FaRegHandPointer, FaPaintBrush } from "react-icons/fa";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { PiLineVerticalBold } from "react-icons/pi";
import { SlGraph } from "react-icons/sl";
import { SiRay } from "react-icons/si";
import { MdOutlineRectangle, MdDelete } from "react-icons/md";
import {
  TbCircle,
  TbWaveSawTool,
  TbVectorBezier2,
  TbVectorTriangle,
} from "react-icons/tb";
import { TiFlowParallel } from "react-icons/ti";

const TOOLS: {
  key: Tool | "select" | "deleteAll";
  label: string;
  icon: JSX.Element;
}[] = [
  { key: "select", label: "Select", icon: <FaRegHandPointer /> },
  { key: "trendline", label: "Trend", icon: <SlGraph /> },
  { key: "ray", label: "Ray", icon: <SiRay /> },
  { key: "vline", label: "V-Line", icon: <PiLineVerticalBold /> },
  { key: "hline", label: "H-Line", icon: <TfiLayoutLineSolid /> },
  { key: "rect", label: "Rect", icon: <MdOutlineRectangle /> },
  { key: "text", label: "Text", icon: <BiText /> },
  { key: "range", label: "Range", icon: <TbWaveSawTool /> },
  { key: "channel", label: "Channel", icon: <TiFlowParallel /> },
  { key: "fib", label: "Fib", icon: <TbVectorBezier2 /> },
  { key: "ellipse", label: "Ellipse", icon: <TbCircle /> },
  { key: "arrow", label: "Arrow", icon: <AiOutlineArrowRight /> },
  { key: "brush", label: "Brush", icon: <FaPaintBrush /> },
  { key: "xabcd", label: "XABCD", icon: <TbVectorTriangle /> },
  { key: "deleteAll", label: "Delete All", icon: <MdDelete /> },
];

export default function LeftToolBar({ disabled }: { disabled?: boolean }) {
  const activeTool = useDrawingStore((s) => s.activeTool);
  const setActiveTool = useDrawingStore((s) => s.setActiveTool);

  return (
    <div className="flex flex-col gap-1 pt-1.5 pr-2 bg-white/80 select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setActiveTool(null)}
        className={[
          "w-10 h-10 flex items-center justify-center rounded-md border shadow-sm cursor-pointer",
          activeTool == null
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
          disabled ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
        title="None"
        aria-label="None"
      >
        <FaMousePointer />
      </button>
      {TOOLS.map((t) => (
        <button
          key={t.key}
          disabled={disabled}
          onClick={() => setActiveTool(activeTool === t.key ? null : t.key)}
          className={[
            "w-10 h-10 flex items-center justify-center rounded-md border shadow-sm",
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
          {t.icon}
        </button>
      ))}
    </div>
  );
}
