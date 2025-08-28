import { useMemo, useState, useEffect } from "react";
import AppHeader from "../components/AppHeader";
import LeftToolBar from "../components/LeftToolBar";
import ChartPanel from "../components/ChartPanel";
import type { Interval } from "../store/chart.store";
import type { LayoutMode } from "../components/LayoutToggle";
import RightSidebar from "../components/RightSideBar";

type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

// Per-panel state kept at the page level
type PanelState = {
  id: number;
  symbol: string;
  interval: Interval;
  showEMA20: boolean;
  showSMA50: boolean;
  showVolume: boolean;
  chartType: ChartType;
};

function initialPanels(n: number): PanelState[] {
  const seeds = [
    { id: 0, symbol: "BTCUSDT", interval: "1m" },
    { id: 1, symbol: "ETHUSDT", interval: "1m" },
    { id: 2, symbol: "LINKUSDT", interval: "1m" },
    { id: 3, symbol: "SOLUSDT", interval: "1m" },
  ];

  return Array.from({ length: n }).map((_, i) => ({
    id: i,
    symbol: seeds[i]?.symbol ?? seeds[0].symbol,
    interval: seeds[i]?.interval ?? seeds[0].interval,
    showEMA20: false,
    showSMA50: false,
    showVolume: false,
    chartType: "candles",
  }));
}

export default function ChartPage() {
  const [layout, setLayout] = useState<LayoutMode>("1");

  // how many panels to show for each layout
  const count = useMemo(() => {
    switch (layout) {
      case "1":
        return 1;
      case "2v":
      case "2h":
        return 2;
      case "3v":
      case "3h":
        return 3;
      case "4":
        return 4;
      default:
        return 1;
    }
  }, [layout]);

  // maintain an array of panel states
  const [panels, setPanels] = useState<PanelState[]>(() =>
    initialPanels(count)
  );

  // when the layout changes, adjust panels length (preserve first N)
  useEffect(() => {
    setPanels((prev) => {
      const next = [...prev];
      if (next.length > count) return next.slice(0, count);
      if (next.length < count) {
        const start = next.length;
        return next.concat(
          initialPanels(count - start).map((p, idx) => ({
            ...p,
            id: start + idx,
          }))
        );
      }
      return next;
    });
  }, [count]);

  // active panel selection
  const [activeId, setActiveId] = useState(0);
  const activePanel = panels.find((p) => p.id === activeId) ?? panels[0];

  const handleChangeActiveChartType = (t: ChartType) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === activeId ? { ...p, chartType: t } : p))
    );
  };

  // grid template per layout
  const gridClass = useMemo(() => {
    switch (layout) {
      case "1":
        return "grid-cols-1 grid-rows-1";
      case "2v":
        return "grid-cols-2 grid-rows-1"; // side-by-side
      case "2h":
        return "grid-cols-1 grid-rows-2"; // stacked
      case "3h":
        return "grid-cols-3 grid-rows-1"; // 3 in a row
      case "3v":
        return "grid-cols-1 grid-rows-3"; // 3 stacked
      case "4":
        return "grid-cols-2 grid-rows-2"; // 2x2
      default:
        return "grid-cols-1 grid-rows-1";
    }
  }, [layout]);

  // handlers to mutate individual panels
  const handleChangeSymbol = (id: number, s: string) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, symbol: s } : p))
    );
  };
  const handleChangeInterval = (id: number, i: Interval) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, interval: i } : p))
    );
  };

  const handleChangeActiveInterval = (i: Interval) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === activeId ? { ...p, interval: i } : p))
    );
  };

  const handleToggleIndicator = (k: "ema20" | "sma50" | "volume") => {
    setPanels((prev) =>
      prev.map((p) => {
        if (p.id !== activeId) return p;
        if (k === "ema20") return { ...p, showEMA20: !p.showEMA20 };
        if (k === "sma50") return { ...p, showSMA50: !p.showSMA50 };
        return { ...p, showVolume: !p.showVolume };
      })
    );
  };

  return (
    <div className="h-[calc(100vh-2rem)] w-full mx-auto max-w-[1800px] p-4 flex flex-col bg-white">
      {/* HEADER */}
      <AppHeader
        activeSymbol={activePanel?.symbol}
        activeInterval={activePanel?.interval}
        layout={layout}
        onLayoutChange={setLayout}
        onRequestChangeSymbol={() => {
          // TODO: open symbol modal later. For now, simple toggle for demo
          if (!activePanel) return;
          handleChangeSymbol(
            activePanel.id,
            activePanel.symbol === "BTCUSDT" ? "XRPUSDT" : "BTCUSDT"
          );
        }}
        onChangeActiveInterval={handleChangeActiveInterval}
        indicatorState={{
          ema20: !!activePanel?.showEMA20,
          sma50: !!activePanel?.showSMA50,
          volume: !!activePanel?.showVolume,
        }}
        onToggleIndicator={handleToggleIndicator}
        activeChartType={activePanel?.chartType ?? "candles"}
        onChangeActiveChartType={handleChangeActiveChartType}
      />

      {/* BODY: left tools | grid | right sidebar */}
      <div className="flex-1 min-h-0 flex">
        <LeftToolBar />

        <div className="flex-1 min-h-0">
          <div className={`grid gap-3 flex-1 min-h-[100%] ${gridClass}`}>
            {panels.map((p) => (
              <div key={p.id} className="min-h-0">
                <ChartPanel
                  id={p.id}
                  active={p.id === activeId}
                  symbol={p.symbol}
                  interval={p.interval}
                  onActivate={setActiveId}
                  onChangeSymbol={handleChangeSymbol}
                  onChangeInterval={handleChangeInterval}
                  showEMA20={p.showEMA20}
                  showSMA50={p.showSMA50}
                  showVolume={p.showVolume}
                  chartType={p.chartType}
                />
              </div>
            ))}
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
}
