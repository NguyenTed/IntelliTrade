import { useEffect } from "react";
import { CandlestickSeries, type BarData } from "lightweight-charts";
import { useChart } from "./ChartContainer";

export const CandlestickSeriesComponent = ({ data }: { data: BarData[] }) => {
  const chartRef = useChart();

  useEffect(() => {
    if (!chartRef.current) return;
    const series = chartRef.current.addSeries(CandlestickSeries);
    series.setData(data);
    return () => chartRef.current?.removeSeries(series);
  }, [data]);

  return null;
};
