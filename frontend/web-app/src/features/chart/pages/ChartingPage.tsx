import { useEffect } from "react";
import { ChartComponent } from "../components/ChartComponent";
import { ChartHeader } from "../layouts/ChartHeader";
import { DrawingToolPanel } from "../layouts/DrawingToolPanel";
import { ToolPanel } from "../layouts/ToolPanel";

export const ChartingPage = () => {
  useEffect(() => {
    // Mở kết nối SSE tới BE
    const es = new EventSource(
      "http://localhost:8888/api/v1/market/stream?symbol=BTCUSDT&interval=1m"
    );

    // Lấy lịch sử 1000 nến
    // const es = new EventSource(
    //   "http://localhost:8888/api/v1/market/history?symbol=BTCUSDT&interval=1m&limit=1000"
    // );

    es.onmessage = (event) => {
      try {
        const candle = JSON.parse(event.data);
        console.log("📈 New candle from BE:", candle);
      } catch (err) {
        console.error("❌ Error parsing SSE message:", err);
      }
    };

    es.onerror = (err) => {
      console.error("❌ SSE connection error:", err);
      es.close(); // tránh loop error
    };

    return () => {
      console.log("👋 Closing SSE connection");
      es.close();
    };
  }, []);
  return (
    <div className="h-screen w-screen bg-[#EBEBEB] overflow-x-hidden">
      {/* Gap between outer edges and content */}
      <div className="flex flex-col gap-2 h-full">
        <ChartHeader />

        <div className="flex flex-1 gap-2">
          <DrawingToolPanel />
          <main className="flex-1 bg-neutral-50 text-black rounded-lg p-4">
            {/* Chart Canvas Placeholder */}
            {/* Chart Canvas Area */}
            <ChartComponent />
          </main>
          <ToolPanel />
        </div>
      </div>
    </div>
  );
};
