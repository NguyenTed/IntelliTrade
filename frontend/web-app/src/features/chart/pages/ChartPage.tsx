import { useMemo, useState, useEffect } from "react";
import AppHeader from "../components/AppHeader";
import LeftToolBar from "../components/LeftToolBar";
import ChartPanel from "../components/ChartPanel";
import type { Interval } from "../store/chart.store";
import type { LayoutMode } from "../components/LayoutToggle";
import RightSidebar from "../components/RightSideBar";
import SymbolModal from "../components/SymbolModal";
import { fetchSymbols, type MarketSymbol } from "../api/market";
import { useBacktest } from "../hooks/useBacktest";
import BacktestResults from "../components/BacktestResult";
import BacktestModal from "../components/BacktestModal";
import BacktestStatsModal from "../components/BacktestStatsModal";
import type { BacktestTrade } from "../types/backtest";
import { fetchPrediction } from "../api/prediction";
import type { PanelPrediction } from "../types/prediction";

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
  backtestTrades?: BacktestTrade[];
  prediction?: PanelPrediction | null;
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
  const [isSymbolModalOpen, setSymbolModalOpen] = useState(false);
  const [symbols, setSymbols] = useState<MarketSymbol[]>([]);
  const [backtestOpen, setBacktestOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const [rightOpen, setRightOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchSymbols();
        if (alive) setSymbols(list);
      } catch (_) {
        // ignore; header can still render without icons
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const activeSymbolImgs = useMemo(() => {
    const s = activePanel?.symbol;
    if (!s) return undefined;
    const hit = symbols.find((m) => m.name === s);
    return hit?.symbolImgs;
  }, [symbols, activePanel?.symbol]);

  const {
    loading: btLoading,
    error: btError,
    result: btResult,
    run: runBacktest,
    reset: resetBacktest,
    lastConfig,
  } = useBacktest(
    activePanel?.symbol ?? "",
    activePanel?.interval ?? ("1m" as Interval)
  );

  useEffect(() => {
    if (!btResult?.trades) return;
    setPanels((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, backtestTrades: btResult.trades } : p
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btResult]);

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
      prev.map((p) =>
        p.id === id
          ? { ...p, symbol: s, backtestTrades: undefined, prediction: null }
          : p
      )
    );
  };
  const handleChangeInterval = (id: number, i: Interval) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, interval: i, backtestTrades: undefined, prediction: null }
          : p
      )
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

  const [predicting, setPredicting] = useState(false);

  const handlePredictActive = async () => {
    if (!activePanel || predicting) return;
    try {
      setPredicting(true);
      const res = await fetchPrediction(
        activePanel.symbol,
        activePanel.interval
      );
      const latest = Number(res.latest_close_price ?? NaN);
      const predicted = Number(res.predicted_close_price ?? NaN);
      if (!Number.isFinite(latest) || !Number.isFinite(predicted)) return;
      const delta = predicted - latest;
      const deltaPct = latest !== 0 ? (delta / latest) * 100 : 0;
      const next: PanelPrediction = {
        latest,
        predicted,
        delta,
        deltaPct,
        trend:
          (res.trend as any) ||
          (delta > 0 ? "UP" : delta < 0 ? "DOWN" : "NEUTRAL"),
        at: Date.now(),
      };
      setPanels((prev) =>
        prev.map((p) => (p.id === activeId ? { ...p, prediction: next } : p))
      );
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] w-full mx-auto max-w-[1800px] p-2 flex flex-col bg-white">
      {/* HEADER */}
      <AppHeader
        activeSymbol={activePanel?.symbol}
        activeSymbolImgs={activeSymbolImgs}
        activeInterval={activePanel?.interval}
        layout={layout}
        onLayoutChange={setLayout}
        onRequestOpenSymbolModal={() => setSymbolModalOpen(true)}
        onChangeActiveInterval={handleChangeActiveInterval}
        indicatorState={{
          ema20: !!activePanel?.showEMA20,
          sma50: !!activePanel?.showSMA50,
          volume: !!activePanel?.showVolume,
        }}
        onToggleIndicator={handleToggleIndicator}
        activeChartType={activePanel?.chartType ?? "candles"}
        onChangeActiveChartType={handleChangeActiveChartType}
        onRequestOpenBacktest={() => setBacktestOpen(true)}
        onToggleRightSidebar={() => setRightOpen((o) => !o)}
        rightSidebarOpen={rightOpen}
        onRequestPredict={handlePredictActive}
        predicting={predicting}
        activePrediction={activePanel?.prediction ?? null}
      />

      {/* BODY: left tools | grid | right sidebar */}
      <div className="flex-1 min-h-0 flex relative">
        <LeftToolBar />

        <div className="flex-1 min-h-0 grid grid-rows-[1fr_auto]">
          <div className={`grid gap-3 min-h-[100%] ${gridClass}`}>
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
                  backtestTrades={p.backtestTrades}
                  prediction={p.prediction}
                />
              </div>
            ))}
          </div>

          {/* Backtest messages & results go UNDER the chart grid (center column only) */}
          <>
            {btError ? (
              <div className="px-4 py-2 text-sm text-rose-600">{btError}</div>
            ) : null}
            {btLoading ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                Running backtest…
              </div>
            ) : null}
            {btResult && (
              <BacktestResults
                data={btResult}
                onOpenStats={() => setStatsOpen(true)}
                onClose={() => {
                  setPanels((prev) =>
                    prev.map((p) =>
                      p.id === activeId
                        ? { ...p, backtestTrades: undefined }
                        : p
                    )
                  );
                  resetBacktest();
                }} // hides the table and clears overlay
              />
            )}
          </>
        </div>

        {rightOpen && (
          <div className="absolute top-0 right-0 h-full w-[50%] shadow-lg bg-white z-50 ">
            <RightSidebar />
          </div>
        )}
      </div>

      <SymbolModal
        open={isSymbolModalOpen}
        onClose={() => setSymbolModalOpen(false)}
        onPick={(next) => {
          if (!activePanel) return;
          handleChangeSymbol(activePanel.id, next);
          setSymbolModalOpen(false);
        }}
      />
      <BacktestModal
        open={backtestOpen}
        onClose={() => setBacktestOpen(false)}
        symbol={activePanel.symbol}
        interval={activePanel.interval}
        defaultStart={(lastConfig?.startTime as string) || undefined}
        defaultEnd={(lastConfig?.endTime as string) || undefined}
        defaultLots={(lastConfig?.lots as number) || undefined}
        defaultSlPct={(lastConfig?.slPct as number) || undefined}
        defaultTpPct={(lastConfig?.tpPct as number) || undefined}
        defaultRules={(lastConfig?.rules as any) || undefined}
        defaultBuy={(lastConfig?.buyCondition as string) || undefined}
        defaultSell={(lastConfig?.sellCondition as string) || undefined}
        onSubmit={async (req) => {
          await runBacktest(req);
          setBacktestOpen(false);
        }}
      />
      <BacktestStatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        stats={btResult?.stats ?? null}
      />
    </div>
  );
}
