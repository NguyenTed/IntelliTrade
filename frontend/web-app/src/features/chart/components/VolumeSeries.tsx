import { useEffect } from "react";
import { HistogramSeries, type HistogramData } from "lightweight-charts";
import { useChart } from "./ChartContainer";

export const VolumeSeriesComponent = ({ data }: { data: HistogramData[] }) => {
  const chartRef = useChart();

  useEffect(() => {
    if (!chartRef.current) return;
    const series = chartRef.current.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    series.priceScale().applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
    });

    series.setData(data);
    return () => chartRef.current?.removeSeries(series);
  }, [data]);

  return null;
};
