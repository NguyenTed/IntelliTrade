// src/features/chart/types/drawing.ts
export type ShapeId = string;

export type Tool =
  | "trendline"
  | "hline"
  | "ray"
  | "rect"
  | "vline"
  | "text"
  | "range"
  | "channel"
  | "fib"
  | "ellipse"
  | "arrow"    // NEW
  | "brush";   // NEW

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

export type VLineShape = ShapeBase & {
  type: "vline";
  time: number; // UTCTimestamp (seconds)
};

export type TextShape = ShapeBase & {
  type: "text";
  p: PricePoint;         // anchor point
  text: string;          // label content
  font?: string;         // e.g. "12px Inter, system-ui, sans-serif"
  bg?: string;           // background fill for legibility
  padding?: number;      // px around text
  align?: "left" | "center" | "right";
};

export type RangeShape = ShapeBase & {
  type: "range";
  p1: PricePoint;
  p2: PricePoint;
  labelColor?: string;  // optional text color
  fill?: string;        // optional fill rgba
};

export type ParallelChannelShape = ShapeBase & {
  type: "channel";
  p1: PricePoint;    // base start
  p2: PricePoint;    // base end
  offsetPx: number;  // perpendicular width in screen pixels (signed)
  fill?: string;     // optional channel fill color (rgba)
};

export type FibLevel = { r: number; color?: string; label?: string };

export type FibShape = ShapeBase & {
  type: "fib";
  p1: PricePoint;
  p2: PricePoint;
  levels?: FibLevel[];           // optional custom levels; defaults at render
  extend?: "none" | "left" | "right" | "both"; // optional extension
  fill?: string;                 // optional fill inside the box
  showPrices?: boolean;          // label shows price at each level
};

export type EllipseShape = ShapeBase & {
  type: "ellipse";
  p1: PricePoint;  // one corner of bounding box
  p2: PricePoint;  // opposite corner
  fill?: string;   // rgba fill
};

export type ArrowShape = ShapeBase & {
  type: "arrow";
  p1: PricePoint;
  p2: PricePoint;
};

export type BrushShape = ShapeBase & {
  type: "brush";
  points: PricePoint[]; // freehand path
  closed?: boolean;
};

export type Shape =
  | TrendlineShape
  | HLineShape
  | RectShape
  | VLineShape
  | TextShape
  | RangeShape
  | ParallelChannelShape
  | FibShape
  | EllipseShape
  | ArrowShape
  | BrushShape;

export type HitTarget =
  | { kind: "none" }
  | { kind: "shape"; id: ShapeId }
  | { kind: "handle"; id: ShapeId; handle: "p1" | "p2" | "p3" | "move" };

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