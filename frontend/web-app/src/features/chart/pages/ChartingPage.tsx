import { ChartComponent } from "../components/ChartComponent";
import { ChartHeader } from "../layouts/ChartHeader";
import { DrawingToolPanel } from "../layouts/DrawingToolPanel";
import { ToolPanel } from "../layouts/ToolPanel";

export const ChartingPage = () => {
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
