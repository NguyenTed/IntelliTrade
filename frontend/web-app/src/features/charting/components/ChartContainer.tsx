import { createChart, type IChartApi, ColorType } from "lightweight-charts";
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

const ChartContext =
  createContext<React.MutableRefObject<IChartApi | null> | null>(null);
export const useChart = () => {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within ChartContainer");
  return ctx;
};

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#fff" },
        textColor: "#000",
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const resize = () => {
      chartRef.current?.applyOptions({
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
      });
    };

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chartRef.current?.remove();
    };
  }, []);

  return (
    <ChartContext.Provider value={chartRef}>
      <div ref={containerRef} className="w-full h-[500px] relative">
        {children}
      </div>
    </ChartContext.Provider>
  );
};
