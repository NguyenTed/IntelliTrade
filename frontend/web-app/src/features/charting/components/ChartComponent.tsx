// import {
//   createChart,
//   ColorType,
//   CandlestickSeries,
//   HistogramSeries,
//   type BarData,
//   type UTCTimestamp,
// } from "lightweight-charts";
// import React, { useEffect, useRef, useState } from "react";

// type ChartComponentProps = {
//   colors?: {
//     backgroundColor?: string;
//     lineColor?: string;
//     textColor?: string;
//     areaTopColor?: string;
//     areaBottomColor?: string;
//   };
// };

// type LegendData = {
//   time: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// };

// export const ChartComponent: React.FC<ChartComponentProps> = ({
//   colors: {
//     backgroundColor = "white",
//     lineColor = "#2962FF",
//     textColor = "black",
//     areaTopColor = "#2962FF",
//     areaBottomColor = "rgba(41, 98, 255, 0.28)",
//   } = {},
// }) => {
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const [legend, setLegend] = useState<LegendData | null>(null);

//   useEffect(() => {
//     if (!chartContainerRef.current) return;

//     const chart = createChart(chartContainerRef.current, {
//       layout: {
//         background: { type: ColorType.Solid, color: backgroundColor },
//         textColor,
//         attributionLogo: false,
//       },
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//     });

//     const currentLocale = window.navigator.languages[0];
//     const myPriceFormatter = Intl.NumberFormat(currentLocale, {
//       style: "currency",
//       currency: "EUR",
//     }).format;

//     chart.applyOptions({
//       localization: {
//         priceFormatter: myPriceFormatter,
//       },
//     });

//     const candleStickData = generateCandlestickData().map((datapoint) => {
//       if (datapoint.close < 205) return datapoint;
//       return { ...datapoint, color: "orange", wickColor: "orange" };
//     });

//     const candlestickSeries = chart.addSeries(CandlestickSeries);
//     candlestickSeries.applyOptions({
//       wickUpColor: "rgb(54, 116, 217)",
//       upColor: "#0A9981",
//       wickDownColor: "#E13255",
//       downColor: "#E13255",
//       borderVisible: false,
//     });
//     candlestickSeries.setData(candleStickData);

//     const volumeData = candleStickData.map((datapoint) => ({
//       time: datapoint.time,
//       value: (datapoint.close + datapoint.open) / 2,
//       color: datapoint.close < datapoint.open ? "red" : "green",
//     }));

//     const volumeSeries = chart.addSeries(HistogramSeries, {
//       priceFormat: { type: "volume" },
//       priceScaleId: "",
//     });

//     volumeSeries.priceScale().applyOptions({
//       scaleMargins: {
//         top: 0.7,
//         bottom: 0,
//       },
//     });

//     candlestickSeries.priceScale().applyOptions({
//       scaleMargins: {
//         top: 0.1,
//         bottom: 0.4,
//       },
//     });

//     volumeSeries.setData(volumeData);
//     chart.timeScale().fitContent();

//     // ✅ LEGEND
//     chart.subscribeCrosshairMove((param) => {
//       if (!param || !param.time || !param.seriesData) {
//         setLegend(null);
//         return;
//       }

//       const data = param.seriesData.get(candlestickSeries);
//       if (!data || !("open" in data)) {
//         setLegend(null);
//         return;
//       }

//       const { open, high, low, close } = data as BarData;
//       const formattedTime = new Date(
//         Number(param.time) * 1000
//       ).toLocaleString();

//       setLegend({ time: formattedTime, open, high, low, close });
//     });

//     const handleResize = () => {
//       chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       chart.remove();
//     };
//   }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

//   console.log("Legend data: ", legend);
//   // console.log(legend?.open, legend?.high, legend?.low, legend?.close);

//   return (
//     <div className="relative w-full h-full">
//       <div ref={chartContainerRef} className="w-full h-full" />
//       {legend && (
//         <div className="absolute top-2 right-2 bg-white bg-opacity-90 text-sm rounded p-2 shadow border text-black">
//           <div className="font-medium">{legend.time}</div>
//           <div>O: {legend.open}</div>
//           <div>H: {legend.high}</div>
//           <div>L: {legend.low}</div>
//           <div>C: {legend.close}</div>
//         </div>
//       )}
//     </div>
//   );
// };

// // You must implement this or import from wherever you store mock data
// function generateCandlestickData(): Array<BarData & { time: number }> {
//   const now = Math.floor(Date.now() / 1000);
//   const points: Array<BarData & { time: number }> = [];
//   let lastClose = 200;

//   for (let i = 0; i < 100; i++) {
//     const open = lastClose + Math.random() * 10 - 5;
//     const close = open + Math.random() * 10 - 5;
//     const high = Math.max(open, close) + Math.random() * 5;
//     const low = Math.min(open, close) - Math.random() * 5;

//     points.push({
//       time: (now + i * 60) as UTCTimestamp, // ✅ Cast to UTCTimestamp
//       open,
//       high,
//       low,
//       close,
//     });

//     lastClose = close;
//   }

//   return points;
// }

import { ChartContainer } from "../components/ChartContainer";
import { CandlestickSeriesComponent } from "../components/CandleStickSeries";
import { VolumeSeriesComponent } from "../components/VolumeSeries";
import { generateCandlestickData } from "../../../mocks/CandleStickData";

const candles = generateCandlestickData();
const volume = candles.map((d) => ({
  time: d.time,
  value: (d.close + d.open) / 2, // or mock number
  color: d.close > d.open ? "green" : "red",
}));

export const ChartComponent = () => {
  return (
    <ChartContainer>
      <CandlestickSeriesComponent data={candles} />
      <VolumeSeriesComponent data={volume} />
    </ChartContainer>
  );
};
