// src/features/chart/types/drawing.ts
export type ShapeId = string;

export type Tool = "trendline" | "hline" | "ray" | "rect"; // we'll implement trendline first

export type PricePoint = {
  time: number;   // UTCTimestamp (seconds)
  price: number;
};

export type ShapeBase = {
  id: ShapeId;
  type: Tool;
  symbol: string;
  interval: string;
  locked?: boolean;
  color?: string;     // stroke color
  width?: number;     // stroke width in px
  opacity?: number;   // for rect fill
};

export type TrendlineShape = ShapeBase & {
  type: "trendline" | "ray";
  p1: PricePoint;
  p2: PricePoint;     // for "ray", p2 gives direction; render extends right
};

export type HLineShape = ShapeBase & {
  type: "hline";
  price: number;
};

export type RectShape = ShapeBase & {
  type: "rect";
  p1: PricePoint; // top-left-ish
  p2: PricePoint; // bottom-right-ish (opposite corner)
};

export type Shape = TrendlineShape | HLineShape | RectShape;

export type HitTarget =
  | { kind: "none" }
  | { kind: "shape"; id: ShapeId }
  | { kind: "handle"; id: ShapeId; handle: "p1" | "p2" | "move" };

// Lightweight “projector” the DrawingLayer uses to convert data<->pixels.
// Parent (LWChartContainer) will construct this from lightweight-charts time/price scales.
export type ChartProjector = {
  timeToX: (time: number) => number | null;
  xToTime: (x: number) => number | null;
  priceToY: (price: number) => number | null;
  yToPrice: (y: number) => number | null;
  // Subscribe to redraw-worthy events (visible range / resize). Returns unsubscribe.
  subscribe: (cb: () => void) => () => void;
};