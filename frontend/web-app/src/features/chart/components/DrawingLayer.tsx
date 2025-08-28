// src/features/chart/components/DrawingLayer.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useDrawingStore } from "../store/drawing.store";
const EMPTY_SHAPES: Shape[] = Object.freeze([]);
import type {
  ChartProjector,
  HitTarget,
  PricePoint,
  Shape,
  TrendlineShape,
  VLineShape,
  TextShape,
  RangeShape,
  ParallelChannelShape,
  FibShape,
  EllipseShape,
  ArrowShape,
  BrushShape,
} from "../types/drawing";
import { saveDrawings, loadDrawings } from "../utils/drawing.persistence";

type Props = {
  symbol: string;
  interval: string;
  projector: ChartProjector;
  editable: boolean; // only active chart is editable
  className?: string;
  chartId: string | number; // stable per-panel id
};

const HANDLE_R = 5; // px
const HIT_TOL = 6; // px for line picking

export default function DrawingLayer({
  symbol,
  interval,
  projector,
  editable,
  className,
  chartId,
}: Props) {
  // --- Per-panel persistence ---
  // Use a stable panel id so drawings persist per layout slot across reloads
  const storageSymbol = `${symbol}::panel-${chartId}`;
  const key = `${storageSymbol}:${interval}`;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const [needsDraw, setNeedsDraw] = useState(0);

  const activeTool = useDrawingStore((s) => s.activeTool);
  const setActiveTool = useDrawingStore((s) => s.setActiveTool);
  const selectedId = useDrawingStore((s) => s.selectedId);
  const select = useDrawingStore((s) => s.select);
  const upsert = useDrawingStore((s) => s.upsert); // still used for finalizing new shapes
  const deleteSelected = useDrawingStore((s) => s.deleteSelected as any);
  const updateById = useDrawingStore((s) => s.updateById as any);
  const load = useDrawingStore((s) => s.load);
  const shapes = useDrawingStore((s) => s.shapes[key] ?? EMPTY_SHAPES);

  // Load from localStorage once per key (now per chart instance)
  useEffect(() => {
    const items = loadDrawings(storageSymbol, interval);
    load(key, items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Autosave on shapes change (persist per chart instance)
  useEffect(() => {
    saveDrawings(storageSymbol, interval, shapes);
  }, [storageSymbol, interval, shapes]);

  // Request a redraw on projector changes (visible range / resize)
  useEffect(() => {
    const unsub = projector.subscribe(() => setNeedsDraw((n) => n + 1));
    return unsub;
  }, [projector]);

  // ========= Interaction state =========
  const creating = useRef<
    | null
    | (
        | {
            tool:
              | "trendline"
              | "ray"
              | "rect"
              | "range"
              | "channel"
              | "fib"
              | "ellipse"
              | "arrow";
            p1: PricePoint;
            p2?: PricePoint;
          }
        | {
            tool: "brush";
            points: PricePoint[];
            closed?: boolean;
          }
      )
  >(null);

  // Brush state
  const [isPointerDown, setIsPointerDown] = useState(false);
  const dragging = useRef<null | {
    id: string;
    mode: "move" | "p1" | "p2";
    anchor: PricePoint;
  }>(null);
  // Only capture events when a tool is active or a gesture is in progress
  const [editingText, setEditingText] = useState<null | {
    id: string;
    value: string;
    x: number;
    y: number;
    w: number;
    h: number;
    align: "left" | "center" | "right";
  }>(null);
  const overlayInteractive =
    (editable &&
      (activeTool === "select" ||
        activeTool === "deleteAll" ||
        !!activeTool ||
        !!creating.current ||
        !!dragging.current)) ||
    !!editingText;

  // Immediate delete-all when toolbar button is clicked (no chart click required)
  useEffect(() => {
    if (!editable) return;
    if (activeTool === "deleteAll") {
      // clear shapes and persist for this panel key
      load(key, []);
      saveDrawings(storageSymbol, interval, []);

      // reset interaction & tool state
      creating.current = null;
      dragging.current = null;
      select(null);
      setActiveTool(null);

      setNeedsDraw((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, editable, key, storageSymbol, interval]);

  // Convert helpers
  const toX = projector.timeToX;
  const toY = projector.priceToY;
  const toTime = projector.xToTime;
  const toPrice = projector.yToPrice;

  // ========= Render pass =========
  const draw = useMemo(() => {
    return () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Resize canvas to device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      if (
        canvas.width !== Math.round(width * dpr) ||
        canvas.height !== Math.round(height * dpr)
      ) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const list = shapes;

      for (const s of list) {
        // --- Arrow ---
        if (s.type === "arrow") {
          const a = s as ArrowShape;
          const x1 = toX(a.p1.time),
            y1 = toY(a.p1.price);
          const x2 = toX(a.p2.time),
            y2 = toY(a.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
          const color = a.color ?? "#0ea5e9";
          const widthPx = Math.max(1, a.width ?? 2);
          ctx.lineWidth = widthPx;
          ctx.strokeStyle = color;

          // Draw shaft
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Draw arrowhead
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy) || 1;
          const headlen = Math.max(12, 8 + widthPx * 2);
          const angle = Math.atan2(dy, dx);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(
            x2 - headlen * Math.cos(angle - Math.PI / 7),
            y2 - headlen * Math.sin(angle - Math.PI / 7)
          );
          ctx.moveTo(x2, y2);
          ctx.lineTo(
            x2 - headlen * Math.cos(angle + Math.PI / 7),
            y2 - headlen * Math.sin(angle + Math.PI / 7)
          );
          ctx.stroke();
          ctx.restore();

          // selection handles
          if (selectedId === s.id) {
            ctx.fillStyle = "#111827";
            drawHandle(ctx, x1, y1);
            drawHandle(ctx, x2, y2);
          }
        }

        // --- Brush ---
        if (s.type === "brush") {
          const b = s as BrushShape;
          if (!b.points || b.points.length < 2) continue;
          ctx.save();
          ctx.lineWidth = Math.max(1, b.width ?? 2);
          ctx.strokeStyle = b.color ?? "#0ea5e9";
          ctx.beginPath();
          for (let i = 0; i < b.points.length; ++i) {
            const px = toX(b.points[i].time);
            const py = toY(b.points[i].price);
            if (px == null || py == null) continue;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          if (b.closed) ctx.closePath();
          ctx.stroke();
          ctx.restore();
          if (selectedId === s.id) {
            // Draw a single, subtle handle at the geometric center of the stroke
            let sx = 0,
              sy = 0,
              cnt = 0;
            for (const pt of b.points) {
              const px = toX(pt.time);
              const py = toY(pt.price);
              if (px != null && py != null) {
                sx += px;
                sy += py;
                cnt++;
              }
            }
            if (cnt > 0) {
              const cx = sx / cnt,
                cy = sy / cnt;
              ctx.fillStyle = "rgba(17,24,39,0.85)"; // slate-900 @ 85%
              drawHandle(ctx, cx, cy);
            }
          }
        }
        if (s.type === "trendline" || s.type === "ray") {
          const tl = s as TrendlineShape;
          const x1 = toX(tl.p1.time),
            y1 = toY(tl.p1.price);
          const x2 = toX(tl.p2.time),
            y2 = toY(tl.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

          const color = tl.color ?? "#0ea5e9"; // sky-500
          const widthPx = Math.max(1, tl.width ?? 2);
          ctx.lineWidth = widthPx;
          ctx.strokeStyle = color;

          ctx.beginPath();
          if (tl.type === "ray") {
            // draw from p1 through p2 to the right edge
            const dx = x2 - x1;
            const dy = y2 - y1;
            const k = dx === 0 ? 0 : dy / dx;
            const xRight = width;
            const yRight = y1 + k * (xRight - x1);
            ctx.moveTo(x1, y1);
            ctx.lineTo(xRight, yRight);
          } else {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.stroke();

          // selection handles
          if (selectedId === s.id) {
            ctx.fillStyle = "#111827"; // gray-900 handles
            drawHandle(ctx, x1, y1);
            if (tl.type === "trendline") drawHandle(ctx, x2, y2);
          }
        }

        if (s.type === "hline") {
          const color = s.color ?? "#0ea5e9";
          const widthPx = Math.max(1, s.width ?? 2);
          const y = toY((s as any).price);
          if (y == null) continue;
          ctx.lineWidth = widthPx;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        if (s.type === "rect") {
          const r = s as any;
          const x1 = toX(r.p1.time),
            y1 = toY(r.p1.price);
          const x2 = toX(r.p2.time),
            y2 = toY(r.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
          const x = Math.min(x1, x2),
            y = Math.min(y1, y2);
          const w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);
          ctx.fillStyle = (r.color ?? "#0ea5e9") + "33"; // alpha fill
          ctx.strokeStyle = r.color ?? "#0ea5e9";
          ctx.lineWidth = Math.max(1, r.width ?? 2);
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
          if (selectedId === s.id) {
            ctx.fillStyle = "#111827";
            drawHandle(ctx, x, y);
            drawHandle(ctx, x + w, y + h);
          }
        }

        if (s.type === "range") {
          const r = s as RangeShape;
          const x1 = toX(r.p1.time),
            y1 = toY(r.p1.price);
          const x2 = toX(r.p2.time),
            y2 = toY(r.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
          const x = Math.min(x1, x2),
            y = Math.min(y1, y2);
          const w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);

          const baseColor = r.color ?? "#0ea5e9";
          ctx.fillStyle = r.fill ?? `${baseColor}22`;
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = Math.max(1, r.width ?? 2);
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);

          // label showing delta, pct, bars count
          const dPrice = r.p2.price - r.p1.price;
          const sign = dPrice > 0 ? "+" : dPrice < 0 ? "−" : "";
          const pct = r.p1.price !== 0 ? (dPrice / r.p1.price) * 100 : 0;
          const bars = barsBetween(r.p1.time, r.p2.time, interval);
          const label = `${sign}${absRound(dPrice)}  (${sign}${absRound(
            pct
          )}%)  •  ${bars} bars`;

          const font = "12px Inter, system-ui, sans-serif";
          const pad = 4;
          ctx.font = font;
          ctx.textBaseline = "top";
          const tw = ctx.measureText(label).width;
          const th = getFontPx(font);
          const boxX = x + 6,
            boxY = y + 6;
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(boxX - pad, boxY - pad, tw + pad * 2, th + pad * 2);
          ctx.fillStyle = r.labelColor ?? "#ffffff";
          ctx.fillText(label, boxX, boxY);

          if (selectedId === s.id) {
            ctx.fillStyle = "#111827";
            drawHandle(ctx, x, y);
            drawHandle(ctx, x + w, y + h);
          }
        }

        // --- Fibonacci Retracement (two points box with level lines) ---
        if (s.type === "fib") {
          const f = s as FibShape;
          const x1 = toX(f.p1.time),
            y1 = toY(f.p1.price);
          const x2 = toX(f.p2.time),
            y2 = toY(f.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

          const xa = Math.min(x1, x2),
            xb = Math.max(x1, x2);
          const ya = y1,
            yb = y2; // keep direction to compute correct price labels

          // optional fill for the band
          if (f.fill) {
            const x = xa,
              w = xb - xa;
            const y = Math.min(ya, yb),
              h = Math.abs(yb - ya);
            ctx.fillStyle = f.fill;
            ctx.fillRect(x, y, w, h);
          }

          const levels = f.levels ?? [
            { r: 0 },
            { r: 0.236 },
            { r: 0.382 },
            { r: 0.5 },
            { r: 0.618 },
            { r: 0.786 },
            { r: 1 },
          ];
          const baseColor = f.color ?? "#0ea5e9";
          const lw = Math.max(1, f.width ?? 2);
          const minPrice = f.p1.price;
          const maxPrice = f.p2.price;
          const priceAt = (r: number) => minPrice + (maxPrice - minPrice) * r;

          const font = "12px Inter, system-ui, sans-serif";
          const pad = 4;

          for (const lv of levels) {
            const yPrice = priceAt(lv.r);
            const yy = toY(yPrice);
            if (yy == null) continue;
            ctx.strokeStyle = lv.color ?? baseColor;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(xa, yy);
            ctx.lineTo(xb, yy);
            ctx.stroke();

            const label =
              lv.label ??
              `${(lv.r * 100).toFixed(1)}%${
                f.showPrices ? `  ${absRound(yPrice)}` : ""
              }`;
            ctx.font = font;
            ctx.textBaseline = "middle";
            const tw = ctx.measureText(label).width;
            const th = getFontPx(font);
            const lx = xa + 6,
              ly = yy - th / 2;
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(lx - pad, ly - pad, tw + pad * 2, th + pad * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(label, lx, ly + 1);
          }

          // border box (subtle)
          ctx.strokeStyle = baseColor + "88";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(xa, Math.min(ya, yb), xb - xa, Math.abs(yb - ya));
          ctx.setLineDash([]);

          if (selectedId === s.id) {
            ctx.fillStyle = "#111827";
            drawHandle(ctx, x1, y1);
            drawHandle(ctx, x2, y2);
          }
        }

        // --- Ellipse defined by bounding box p1..p2 ---
        if (s.type === "ellipse") {
          const el = s as EllipseShape;
          const x1 = toX(el.p1.time),
            y1 = toY(el.p1.price);
          const x2 = toX(el.p2.time),
            y2 = toY(el.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

          const x = Math.min(x1, x2),
            y = Math.min(y1, y2);
          const w = Math.abs(x2 - x1),
            h = Math.abs(y2 - y1);
          const cx = x + w / 2,
            cy = y + h / 2;

          const stroke = el.color ?? "#0ea5e9";
          const fill = el.fill ?? stroke + "22";
          const lw = Math.max(1, el.width ?? 2);

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.lineWidth = lw;
          ctx.strokeStyle = stroke;
          ctx.stroke();
          ctx.restore();

          if (selectedId === s.id) {
            ctx.fillStyle = "#111827";
            drawHandle(ctx, x, y);
            drawHandle(ctx, x + w, y + h);
          }
        }

        // Parallel Channel (two rails + filled quad)
        if (s.type === "channel") {
          const ch = s as ParallelChannelShape;
          const x1 = toX(ch.p1.time),
            y1 = toY(ch.p1.price);
          const x2 = toX(ch.p2.time),
            y2 = toY(ch.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

          const dx = x2 - x1,
            dy = y2 - y1;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len,
            ny = dx / len; // unit normal
          const ox = nx * ch.offsetPx,
            oy = ny * ch.offsetPx;

          const x1b = x1 + ox,
            y1b = y1 + oy;
          const x2b = x2 + ox,
            y2b = y2 + oy;

          const baseColor = ch.color ?? "#0ea5e9";
          const fill = ch.fill ?? `${baseColor}1a`;
          const lw = Math.max(1, ch.width ?? 2);

          // fill quad
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2b, y2b);
          ctx.lineTo(x1b, y1b);
          ctx.closePath();
          ctx.fill();

          // rails
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x1b, y1b);
          ctx.lineTo(x2b, y2b);
          ctx.stroke();

          if (selectedId === s.id) {
            ctx.fillStyle = "#111827";
            drawHandle(ctx, x1, y1);
            drawHandle(ctx, x2, y2);
            // offset handle in the middle of offset rail
            const mxh = (x1b + x2b) / 2,
              myh = (y1b + y2b) / 2;
            drawHandle(ctx, mxh, myh);
          }
        }

        if (s.type === "vline") {
          const x = toX((s as VLineShape).time);
          if (x == null) continue;
          const color = s.color ?? "#0ea5e9";
          const widthPx = Math.max(1, s.width ?? 2);
          ctx.lineWidth = widthPx;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(width, 0); // ensure path starts (noop)
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        if (s.type === "text") {
          const t = s as TextShape;
          const x = toX(t.p.time),
            y = toY(t.p.price);
          if (x == null || y == null) continue;
          const font = t.font ?? "12px Inter, system-ui, sans-serif";
          const pad = t.padding ?? 4;
          const txt = t.text ?? "Text";
          ctx.font = font;
          ctx.textBaseline = "top";
          const textW = ctx.measureText(txt).width;
          const textH = getFontPx(font);
          let drawX = x;
          if (t.align === "center") drawX = x - textW / 2;
          else if (t.align === "right") drawX = x - textW;
          const bg = t.bg ?? "rgba(255,255,255,0.75)";
          ctx.fillStyle = bg;
          ctx.fillRect(drawX - pad, y - pad, textW + pad * 2, textH + pad * 2);
          ctx.fillStyle = t.color ?? "#111827";
          ctx.fillText(txt, drawX, y);
        }
      }

      // Draw preview during creation (trendline, ray, rect, etc, arrow, brush)
      if (creating.current) {
        if ("tool" in creating.current && creating.current.tool === "arrow") {
          // Arrow preview: draw dashed line from p1 to hover
          const p1 = creating.current.p1;
          const p2 = hoverPoint.current;
          const x1 = toX(p1.time),
            y1 = toY(p1.price);
          const x2 = p2 ? toX(p2.time) : null,
            y2 = p2 ? toY(p2.price) : null;
          if (x1 != null && y1 != null && x2 != null && y2 != null) {
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          return;
        }
        if ("tool" in creating.current && creating.current.tool === "brush") {
          // Brush preview: dashed polyline connecting points + hover
          const points = creating.current.points;
          if (points.length > 0) {
            ctx.save();
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            for (let i = 0; i < points.length; ++i) {
              const px = toX(points[i].time);
              const py = toY(points[i].price);
              if (px == null || py == null) continue;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            if (hoverPoint.current) {
              const px = toX(hoverPoint.current.time);
              const py = toY(hoverPoint.current.price);
              if (px != null && py != null) ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
          return;
        }
        if ("tool" in creating.current) {
          const tool = creating.current.tool;
          const p1 = creating.current.p1;
          const p2 = hoverPoint.current;
          const x1 = toX(p1.time),
            y1 = toY(p1.price);
          const x2 = p2 ? toX(p2.time) : null,
            y2 = p2 ? toY(p2.price) : null;
          if (x1 != null && y1 != null && x2 != null && y2 != null) {
            // --- Top-level preview logic for each tool ---
            if (tool === "rect" || tool === "range") {
              const x = Math.min(x1, x2),
                y = Math.min(y1, y2);
              const w = Math.abs(x2 - x1),
                h = Math.abs(y2 - y1);
              ctx.strokeStyle = "#94a3b8"; // slate-400
              ctx.lineWidth = 1.5;
              ctx.setLineDash([5, 4]);
              ctx.beginPath();
              ctx.rect(x, y, w, h);
              ctx.stroke();
              ctx.setLineDash([]);
              return;
            } else if (tool === "channel") {
              // Channel creation is 3-clicks: p1 -> p2 -> offset
              if (creating.current?.p2) {
                // === After second click: draw BASE line as committed (solid),
                // and preview offset rail + fill + width label under cursor
                const baseP1 = creating.current.p1;
                const baseP2 = creating.current.p2;
                const bx1 = toX(baseP1.time)!;
                const by1 = toY(baseP1.price)!;
                const bx2 = toX(baseP2.time)!;
                const by2 = toY(baseP2.price)!;

                // draw base line SOLID (committed look)
                ctx.setLineDash([]);
                ctx.strokeStyle = "#0ea5e9"; // sky-500
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(bx1, by1);
                ctx.lineTo(bx2, by2);
                ctx.stroke();

                // draw base handles so it feels placed
                ctx.fillStyle = "#111827"; // handles
                drawHandle(ctx, bx1, by1);
                drawHandle(ctx, bx2, by2);

                // compute preview offset rail using current hover
                const dx = bx2 - bx1,
                  dy = by2 - by1;
                const len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len,
                  ny = dx / len;

                const hx = toX(hoverPoint.current!.time)!;
                const hy = toY(hoverPoint.current!.price)!;
                const dist = (hx - bx1) * nx + (hy - by1) * ny; // signed px offset
                const ox = nx * dist,
                  oy = ny * dist;
                const bx1b = bx1 + ox,
                  by1b = by1 + oy;
                const bx2b = bx2 + ox,
                  by2b = by2 + oy;

                // dashed preview rail
                ctx.setLineDash([5, 4]);
                ctx.strokeStyle = "#94a3b8"; // slate-400
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(bx1b, by1b);
                ctx.lineTo(bx2b, by2b);
                ctx.stroke();

                // lightly fill the quad to visualize width
                ctx.setLineDash([]);
                ctx.fillStyle = "rgba(14,165,233,0.08)"; // sky-500 @ low alpha
                ctx.beginPath();
                ctx.moveTo(bx1, by1);
                ctx.lineTo(bx2, by2);
                ctx.lineTo(bx2b, by2b);
                ctx.lineTo(bx1b, by1b);
                ctx.closePath();
                ctx.fill();

                // width label (price delta between rails at mid)
                const midx = (bx1 + bx2) / 2;
                const midy = (by1 + by2) / 2;
                const midPriceA = projector.yToPrice(midy);
                const midPriceB = projector.yToPrice(midy + oy);
                if (midPriceA != null && midPriceB != null) {
                  const dPrice = Math.abs(midPriceB - midPriceA);
                  const label = `Width: ${absRound(dPrice)}`;
                  const font = "12px Inter, system-ui, sans-serif";
                  const pad = 4;
                  ctx.font = font;
                  ctx.textBaseline = "top";
                  const tw = ctx.measureText(label).width;
                  const th = getFontPx(font);
                  const lx = midx + 8;
                  const ly = midy + oy / 2 - th / 2;
                  ctx.fillStyle = "rgba(0,0,0,0.55)";
                  ctx.fillRect(lx - pad, ly - pad, tw + pad * 2, th + pad * 2);
                  ctx.fillStyle = "#ffffff";
                  ctx.fillText(label, lx, ly);
                }
                return;
              } else {
                // First leg preview (before p2 confirmed): simple dashed base
                ctx.strokeStyle = "#94a3b8";
                ctx.lineWidth = 1.5;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.setLineDash([]);
                return;
              }
            } else if (tool === "fib") {
              // Two-click tool. After first click, preview committed-looking box and dashed fib lines to hover
              const base = creating.current.p1;
              const bx1 = toX(base.time)!;
              const by1 = toY(base.price)!;
              const bx2 = x2!;
              const by2 = y2!;
              const xa = Math.min(bx1, bx2),
                xb = Math.max(bx1, bx2);
              const ya = by1,
                yb = by2;

              // solid box border
              ctx.setLineDash([]);
              ctx.strokeStyle = "#0ea5e9";
              ctx.lineWidth = 2;
              ctx.strokeRect(xa, Math.min(ya, yb), xb - xa, Math.abs(yb - ya));

              // dashed fib lines
              const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
              ctx.setLineDash([5, 4]);
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 1.5;
              for (const r of levels) {
                const yy = ya + (yb - ya) * r;
                ctx.beginPath();
                ctx.moveTo(xa, yy);
                ctx.lineTo(xb, yy);
                ctx.stroke();
              }
              ctx.setLineDash([]);
              return;
            } else if (tool === "ellipse") {
              // Two-click dashed ellipse preview between p1 and hover
              const ex1 = x1!,
                ey1 = y1!;
              const ex2 = x2!,
                ey2 = y2!;
              const x = Math.min(ex1, ex2),
                y = Math.min(ey1, ey2);
              const w = Math.abs(ex2 - ex1),
                h = Math.abs(ey2 - ey1);
              const cx = x + w / 2,
                cy = y + h / 2;
              ctx.setLineDash([5, 4]);
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              return;
            } else {
              // trendline / ray preview
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 1.5;
              ctx.setLineDash([5, 4]);
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              ctx.setLineDash([]);
              return;
            }
          }
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, selectedId, projector, activeTool, needsDraw]);

  // raf render loop trigger
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, needsDraw]);

  // ========= Hit testing =========
  const hoverPoint = useRef<PricePoint | null>(null);

  function hitTestLine(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): boolean {
    // distance from point to segment
    const A = x - x1,
      B = y - y1,
      C = x2 - x1,
      D = y2 - y1;
    const dot = A * C + B * D;
    const len = C * C + D * D;
    let t = len ? dot / len : 0;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * C,
      py = y1 + t * D;
    const dx = x - px,
      dy = y - py;
    return Math.hypot(dx, dy) <= HIT_TOL;
  }

  function pick(mx: number, my: number): HitTarget {
    const list = shapes;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      // Arrow hit test
      if (s.type === "arrow") {
        const a = s as ArrowShape;
        const x1 = projector.timeToX(a.p1.time),
          y1 = projector.priceToY(a.p1.price);
        const x2 = projector.timeToX(a.p2.time),
          y2 = projector.priceToY(a.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        // handles
        if (Math.hypot(mx - x1, my - y1) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p1" };
        if (Math.hypot(mx - x2, my - y2) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p2" };
        // shaft
        if (hitTestLine(mx, my, x1, y1, x2, y2))
          return { kind: "handle", id: s.id, handle: "move" };
      }
      // Brush hit test
      if (s.type === "brush") {
        const b = s as BrushShape;
        if (!b.points || b.points.length < 2) continue;
        for (let j = 0; j < b.points.length - 1; ++j) {
          const pt1 = b.points[j],
            pt2 = b.points[j + 1];
          const x1 = projector.timeToX(pt1.time),
            y1 = projector.priceToY(pt1.price);
          const x2 = projector.timeToX(pt2.time),
            y2 = projector.priceToY(pt2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
          if (hitTestLine(mx, my, x1, y1, x2, y2))
            return { kind: "handle", id: s.id, handle: "move" };
        }
        // Optionally, check for closed path
        if (b.closed && b.points.length > 2) {
          const pt1 = b.points[b.points.length - 1],
            pt2 = b.points[0];
          const x1 = projector.timeToX(pt1.time),
            y1 = projector.priceToY(pt1.price);
          const x2 = projector.timeToX(pt2.time),
            y2 = projector.priceToY(pt2.price);
          if (x1 != null && y1 != null && x2 != null && y2 != null) {
            if (hitTestLine(mx, my, x1, y1, x2, y2))
              return { kind: "handle", id: s.id, handle: "move" };
          }
        }
      }
      if (s.type === "vline") {
        const x = toX((s as VLineShape).time);
        if (x != null && Math.abs(mx - x) <= HIT_TOL) {
          return { kind: "handle", id: s.id, handle: "move" };
        }
      }
      if (s.type === "text") {
        const t = s as TextShape;
        const font = t.font ?? "12px Inter, system-ui, sans-serif";
        const pad = t.padding ?? 4;
        const txt = t.text ?? "Text";
        const x = toX(t.p.time),
          y = toY(t.p.price);
        if (x != null && y != null) {
          // measure
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.font = font;
            ctx.textBaseline = "top";
            const w = ctx.measureText(txt).width;
            const h = getFontPx(font);
            let drawX = x;
            if (t.align === "center") drawX = x - w / 2;
            else if (t.align === "right") drawX = x - w;
            const bx = drawX - pad,
              by = y - pad,
              bw = w + pad * 2,
              bh = h + pad * 2;
            if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
              return { kind: "handle", id: s.id, handle: "move" };
            }
          }
        }
      }
      if (s.type === "trendline" || s.type === "ray") {
        const tl = s as TrendlineShape;
        const x1 = projector.timeToX(tl.p1.time),
          y1 = projector.priceToY(tl.p1.price);
        const x2 = projector.timeToX(tl.p2.time),
          y2 = projector.priceToY(tl.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        // handles first (for ray only p1 is a handle)
        if (Math.hypot(mx - x1, my - y1) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p1" };
        if (
          s.type === "trendline" &&
          Math.hypot(mx - x2, my - y2) <= HANDLE_R + 2
        )
          return { kind: "handle", id: s.id, handle: "p2" };
        if (hitTestLine(mx, my, x1, y1, x2, y2))
          return { kind: "handle", id: s.id, handle: "move" };
      }
      if (s.type === "hline") {
        const y = projector.priceToY((s as any).price);
        if (y == null) continue;
        if (Math.abs(my - y) <= HIT_TOL)
          return { kind: "handle", id: s.id, handle: "move" };
      }
      if (s.type === "rect" || s.type === "range") {
        const r = s as any;
        const x1 = projector.timeToX(r.p1.time),
          y1 = projector.priceToY(r.p1.price);
        const x2 = projector.timeToX(r.p2.time),
          y2 = projector.priceToY(r.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        const x = Math.min(x1, x2),
          y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1),
          h = Math.abs(y2 - y1);
        // handles
        if (Math.hypot(mx - x, my - y) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p1" };
        if (Math.hypot(mx - (x + w), my - (y + h)) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p2" };
        // interior move
        if (mx >= x && mx <= x + w && my >= y && my <= y + h)
          return { kind: "handle", id: s.id, handle: "move" };
      }
      if (s.type === "fib") {
        const f = s as FibShape;
        const x1 = projector.timeToX(f.p1.time),
          y1 = projector.priceToY(f.p1.price);
        const x2 = projector.timeToX(f.p2.time),
          y2 = projector.priceToY(f.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        // Handles on p1 and p2
        if (Math.hypot(mx - x1, my - y1) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p1" };
        if (Math.hypot(mx - x2, my - y2) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p2" };
        // Hit test interior bounding box
        const xa = Math.min(x1, x2),
          xb = Math.max(x1, x2);
        const ya = Math.min(y1, y2),
          yb = Math.max(y1, y2);
        if (mx >= xa && mx <= xb && my >= ya && my <= yb) {
          return { kind: "handle", id: s.id, handle: "move" };
        }
      }
      if (s.type === "ellipse") {
        const el = s as EllipseShape;
        const x1 = projector.timeToX(el.p1.time),
          y1 = projector.priceToY(el.p1.price);
        const x2 = projector.timeToX(el.p2.time),
          y2 = projector.priceToY(el.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        const x = Math.min(x1, x2),
          y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1),
          h = Math.abs(y2 - y1);
        // Handles on p1 and p2 (corners)
        if (Math.hypot(mx - x, my - y) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p1" };
        if (Math.hypot(mx - (x + w), my - (y + h)) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p2" };
        // Hit test ellipse interior or near boundary
        const cx = x + w / 2,
          cy = y + h / 2;
        if (w < 2 || h < 2) continue;
        const nx = (mx - cx) / (w / 2);
        const ny = (my - cy) / (h / 2);
        const d = nx * nx + ny * ny; // 1 = boundary, <1 interior
        if (Math.abs(d - 1) <= 0.1 || d < 1) {
          return { kind: "handle", id: s.id, handle: "move" };
        }
      }
      if (s.type === "channel") {
        const ch = s as ParallelChannelShape;
        const x1 = projector.timeToX(ch.p1.time),
          y1 = projector.priceToY(ch.p1.price);
        const x2 = projector.timeToX(ch.p2.time),
          y2 = projector.priceToY(ch.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        const dx = x2 - x1,
          dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len,
          ny = dx / len;
        const ox = nx * ch.offsetPx,
          oy = ny * ch.offsetPx;
        const x1b = x1 + ox,
          y1b = y1 + oy,
          x2b = x2 + ox,
          y2b = y2 + oy;

        // endpoint handles
        if (Math.hypot(mx - x1, my - y1) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p1" };
        if (Math.hypot(mx - x2, my - y2) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p2" };

        // offset handle: middle of upper rail
        const mxh = (x1b + x2b) / 2,
          myh = (y1b + y2b) / 2;
        if (Math.hypot(mx - mxh, my - myh) <= HANDLE_R + 2)
          return { kind: "handle", id: s.id, handle: "p3" };

        // rails or interior
        if (
          hitTestLine(mx, my, x1, y1, x2, y2) ||
          hitTestLine(mx, my, x1b, y1b, x2b, y2b)
        )
          return { kind: "handle", id: s.id, handle: "move" };
        if (pointInQuad(mx, my, x1, y1, x2, y2, x2b, y2b, x1b, y1b))
          return { kind: "handle", id: s.id, handle: "move" };
      }
    }
    return { kind: "none" };
  }

  // ========= Mouse handlers =========
  const onPointerDown = (e: React.PointerEvent) => {
    if (!editable) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Delete-all tool: clear all drawings on this panel key
    if (activeTool === "deleteAll") {
      // clear shapes for this key and persist immediately
      load(key, []);
      saveDrawings(storageSymbol, interval, []);
      // reset interaction state
      creating.current = null;
      dragging.current = null;
      select(null);
      setActiveTool(null);
      setNeedsDraw((n) => n + 1);
      return;
    }

    // Quick single-click tools
    if (activeTool === "vline") {
      const time = toTime(mx) ?? 0;
      const id = genId();
      const v: VLineShape = {
        id,
        type: "vline",
        symbol,
        interval,
        time,
        color: "#0ea5e9",
        width: 2,
      };
      upsert(key, v);
      select(id);
      setNeedsDraw((n) => n + 1);
      return;
    }
    if (activeTool === "text") {
      const p: PricePoint = { time: toTime(mx) ?? 0, price: toPrice(my) ?? 0 };
      const id = genId();
      const t: TextShape = {
        id,
        type: "text",
        symbol,
        interval,
        p,
        text: "Text",
        color: "#111827",
        bg: "rgba(255,255,255,0.75)",
        font: "12px Inter, system-ui, sans-serif",
        align: "left",
        padding: 4,
      };
      upsert(key, t);
      select(id);
      setNeedsDraw((n) => n + 1);
      return;
    }

    // If creating with tool
    if (
      activeTool === "trendline" ||
      activeTool === "ray" ||
      activeTool === "rect" ||
      activeTool === "range" ||
      activeTool === "channel" ||
      activeTool === "hline" ||
      activeTool === "fib" ||
      activeTool === "ellipse" ||
      activeTool === "arrow" ||
      activeTool === "brush"
    ) {
      if (activeTool === "hline") {
        // single-click create
        const price = projector.yToPrice(my) ?? 0;
        const id = genId();
        const h = {
          id,
          type: "hline" as const,
          symbol,
          interval,
          price,
          color: "#0ea5e9",
          width: 2,
        } as Shape;
        upsert(key, h);
        select(id);
        setNeedsDraw((n) => n + 1);
        return;
      }

      if (activeTool === "arrow") {
        // Arrow: like trendline, two clicks
        if (!creating.current) {
          const p1 = {
            time: projector.xToTime(mx) ?? 0,
            price: projector.yToPrice(my) ?? 0,
          };
          creating.current = { tool: "arrow", p1 };
          e.preventDefault();
        } else {
          const p2 = {
            time: projector.xToTime(mx) ?? 0,
            price: projector.yToPrice(my) ?? 0,
          };
          const id = genId();
          const shape: ArrowShape = {
            id,
            type: "arrow",
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          };
          upsert(key, shape);
          creating.current = null;
          select(id);
        }
        setNeedsDraw((n) => n + 1);
        return;
      }
      if (activeTool === "brush") {
        // Brush: initialize points array and enter drawing mode
        const p = {
          time: projector.xToTime(mx) ?? 0,
          price: projector.yToPrice(my) ?? 0,
        };
        creating.current = { tool: "brush", points: [p] };
        setIsPointerDown(true);
        canvas.setPointerCapture?.(e.pointerId);
        setNeedsDraw((n) => n + 1);
        return;
      }
      if (!creating.current) {
        const p1 = {
          time: projector.xToTime(mx) ?? 0,
          price: projector.yToPrice(my) ?? 0,
        };
        const tool =
          activeTool === "rect"
            ? "rect"
            : activeTool === "range"
            ? "range"
            : activeTool === "ray"
            ? "ray"
            : activeTool === "channel"
            ? "channel"
            : activeTool === "fib"
            ? "fib"
            : activeTool === "ellipse"
            ? "ellipse"
            : "trendline";
        creating.current = { tool, p1 };
        e.preventDefault(); // start of gesture
      } else if (
        "tool" in creating.current &&
        creating.current.tool === "channel" &&
        !creating.current.p2
      ) {
        // second click sets the base end
        creating.current.p2 = {
          time: projector.xToTime(mx) ?? 0,
          price: projector.yToPrice(my) ?? 0,
        };
        setNeedsDraw((n) => n + 1);
        return;
      } else if ("tool" in creating.current) {
        const p2 = {
          time: projector.xToTime(mx) ?? 0,
          price: projector.yToPrice(my) ?? 0,
        };
        const id = genId();
        if (creating.current.tool === "rect") {
          const shape = {
            id,
            type: "rect" as const,
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          } as Shape;
          upsert(key, shape);
        } else if (creating.current.tool === "range") {
          const shape: RangeShape = {
            id,
            type: "range",
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          };
          upsert(key, shape);
        } else if (creating.current.tool === "channel" && creating.current.p2) {
          const id = genId();
          const x1 = toX(creating.current.p1.time)!,
            y1 = toY(creating.current.p1.price)!;
          const x2 = toX(creating.current.p2.time)!,
            y2 = toY(creating.current.p2.price)!;
          const dx = x2 - x1,
            dy = y2 - y1;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len,
            ny = dx / len;
          const t = projector.xToTime(mx) ?? 0;
          const p = projector.yToPrice(my) ?? 0;
          const mxp = toX(t)!,
            myp = toY(p)!;
          const offsetPx = (mxp - x1) * nx + (myp - y1) * ny; // signed distance
          const shape: ParallelChannelShape = {
            id,
            type: "channel",
            symbol,
            interval,
            p1: creating.current.p1,
            p2: creating.current.p2,
            offsetPx,
            color: "#0ea5e9",
            width: 2,
          };
          upsert(key, shape);
        } else if (creating.current.tool === "ray") {
          const shape = {
            id,
            type: "ray" as const,
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          } as Shape;
          upsert(key, shape);
        } else if (creating.current.tool === "fib") {
          const shape: FibShape = {
            id,
            type: "fib",
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          };
          upsert(key, shape);
        } else if (creating.current.tool === "ellipse") {
          const shape: EllipseShape = {
            id,
            type: "ellipse",
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          };
          upsert(key, shape);
        } else {
          const shape = {
            id,
            type: "trendline" as const,
            symbol,
            interval,
            p1: creating.current.p1,
            p2,
            color: "#0ea5e9",
            width: 2,
          } as Shape;
          upsert(key, shape);
        }
        creating.current = null;
        select(id);
      }
      setNeedsDraw((n) => n + 1);
      return;
    }

    // Selection / drag (only when Select tool is active)
    if (activeTool === "select") {
      const hit = pick(mx, my);
      if (hit.kind === "none") {
        select(null);
      } else {
        select(hit.id);
        if (hit.kind === "handle") {
          const time = projector.xToTime(mx) ?? 0;
          const price = projector.yToPrice(my) ?? 0;
          dragging.current = {
            id: hit.id,
            mode: hit.handle,
            anchor: { time, price },
          };
          e.preventDefault(); // start of drag
        }
      }
      setNeedsDraw((n) => n + 1);
      return;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Brush tool: if drawing, append new point
    if (
      creating.current &&
      "tool" in creating.current &&
      creating.current.tool === "brush" &&
      isPointerDown
    ) {
      const p = {
        time: projector.xToTime(mx) ?? 0,
        price: projector.yToPrice(my) ?? 0,
      };
      creating.current.points.push(p);
      setNeedsDraw((n) => n + 1);
      return;
    }

    // live preview while creating
    if (creating.current) {
      hoverPoint.current = {
        time: projector.xToTime(mx) ?? 0,
        price: projector.yToPrice(my) ?? 0,
      };
      setNeedsDraw((n) => n + 1);
      return;
    }

    // dragging
    if (dragging.current) {
      const id = dragging.current.id;
      const t = projector.xToTime(mx) ?? 0;
      const p = projector.yToPrice(my) ?? 0;

      updateById(key, id, (prev: Shape) => {
        const s = { ...prev } as any;
        if (s.type === "vline") {
          s.time = t;
          return s as Shape;
        }
        if (s.type === "text") {
          s.p = { time: t, price: p };
          return s as Shape;
        }
        if (s.type === "hline") {
          s.price = p;
          return s as Shape;
        }
        if (s.type === "rect" || s.type === "range") {
          if (dragging.current!.mode === "move") {
            const dt = t - dragging.current!.anchor.time;
            const dp = p - dragging.current!.anchor.price;
            s.p1 = { time: s.p1.time + dt, price: s.p1.price + dp };
            s.p2 = { time: s.p2.time + dt, price: s.p2.price + dp };
            dragging.current!.anchor = { time: t, price: p };
          } else if (dragging.current!.mode === "p1") {
            s.p1 = { time: t, price: p };
          } else if (dragging.current!.mode === "p2") {
            s.p2 = { time: t, price: p };
          }
          return s as Shape;
        }
        if (s.type === "fib") {
          if (dragging.current!.mode === "move") {
            const dt = t - dragging.current!.anchor.time;
            const dp = p - dragging.current!.anchor.price;
            s.p1 = { time: s.p1.time + dt, price: s.p1.price + dp };
            s.p2 = { time: s.p2.time + dt, price: s.p2.price + dp };
            dragging.current!.anchor = { time: t, price: p };
          } else if (dragging.current!.mode === "p1") {
            s.p1 = { time: t, price: p };
          } else if (dragging.current!.mode === "p2") {
            s.p2 = { time: t, price: p };
          }
          return s as Shape;
        }
        if (s.type === "ellipse") {
          if (dragging.current!.mode === "move") {
            const dt = t - dragging.current!.anchor.time;
            const dp = p - dragging.current!.anchor.price;
            s.p1 = { time: s.p1.time + dt, price: s.p1.price + dp };
            s.p2 = { time: s.p2.time + dt, price: s.p2.price + dp };
            dragging.current!.anchor = { time: t, price: p };
          } else if (dragging.current!.mode === "p1") {
            s.p1 = { time: t, price: p };
          } else if (dragging.current!.mode === "p2") {
            s.p2 = { time: t, price: p };
          }
          return s as Shape;
        }
        if (s.type === "channel") {
          const ch = s as ParallelChannelShape;
          if (dragging.current!.mode === "move") {
            const dt = t - dragging.current!.anchor.time;
            const dp = p - dragging.current!.anchor.price;
            ch.p1 = { time: ch.p1.time + dt, price: ch.p1.price + dp };
            ch.p2 = { time: ch.p2.time + dt, price: ch.p2.price + dp };
            dragging.current!.anchor = { time: t, price: p };
            return ch as Shape;
          }
          if (dragging.current!.mode === "p1") {
            ch.p1 = { time: t, price: p };
            return ch as Shape;
          }
          if (dragging.current!.mode === "p2") {
            ch.p2 = { time: t, price: p };
            return ch as Shape;
          }
          if (dragging.current!.mode === "p3") {
            const x1 = toX(ch.p1.time)!,
              y1 = toY(ch.p1.price)!;
            const x2 = toX(ch.p2.time)!,
              y2 = toY(ch.p2.price)!;
            const dx = x2 - x1,
              dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len,
              ny = dx / len;
            const mxp = projector.timeToX(t)!,
              myp = projector.priceToY(p)!;
            ch.offsetPx = (mxp - x1) * nx + (myp - y1) * ny;
            return ch as Shape;
          }
        }
        // trendline, ray, arrow
        // --- Brush move logic ---
        if (s.type === "brush") {
          if (dragging.current!.mode === "move") {
            const dt = t - dragging.current!.anchor.time;
            const dp = p - dragging.current!.anchor.price;
            s.points = s.points.map((pt: PricePoint) => ({
              time: pt.time + dt,
              price: pt.price + dp,
            }));
            dragging.current!.anchor = { time: t, price: p };
          }
          return s as Shape;
        }
        if (s.type === "arrow") {
          if (dragging.current!.mode === "move") {
            const dt = t - dragging.current!.anchor.time;
            const dp = p - dragging.current!.anchor.price;
            s.p1 = { time: s.p1.time + dt, price: s.p1.price + dp };
            s.p2 = { time: s.p2.time + dt, price: s.p2.price + dp };
            dragging.current!.anchor = { time: t, price: p };
          } else if (dragging.current!.mode === "p1") {
            s.p1 = { time: t, price: p };
          } else if (dragging.current!.mode === "p2") {
            s.p2 = { time: t, price: p };
          }
          return s as Shape;
        }
        if (dragging.current!.mode === "move") {
          const dt = t - dragging.current!.anchor.time;
          const dp = p - dragging.current!.anchor.price;
          s.p1 = { time: s.p1.time + dt, price: s.p1.price + dp };
          s.p2 = { time: s.p2.time + dt, price: s.p2.price + dp };
          dragging.current!.anchor = { time: t, price: p };
        } else if (dragging.current!.mode === "p1") {
          s.p1 = { time: t, price: p };
        } else if (dragging.current!.mode === "p2") {
          s.p2 = { time: t, price: p };
        }
        return s as Shape;
      });

      setNeedsDraw((n) => n + 1);
    }
  };
  const onDoubleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    // find topmost text under pointer
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (s.type !== "text") continue;
      const t = s as TextShape;
      const font = t.font ?? "12px Inter, system-ui, sans-serif";
      const pad = t.padding ?? 4;
      const txt = t.text ?? "Text";
      const x = toX(t.p.time),
        y = toY(t.p.price);
      if (x == null || y == null) continue;
      ctx.font = font;
      ctx.textBaseline = "top";
      const w = ctx.measureText(txt).width;
      const h = getFontPx(font);
      let drawX = x;
      if (t.align === "center") drawX = x - w / 2;
      else if (t.align === "right") drawX = x - w;
      const bx = drawX - pad,
        by = y - pad,
        bw = w + pad * 2,
        bh = h + pad * 2;
      if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
        // Switch to inline editing instead of prompt
        select(null);
        setEditingText({
          id: s.id,
          value: t.text ?? "Text",
          x: bx,
          y: by,
          w: bw,
          h: bh,
          align: t.align ?? "left",
        });
        return;
      }
    }
  };
  // Reposition editor when projector changes or shapes update.
  useEffect(() => {
    if (!editingText) return;
    const s = shapes.find((sh) => sh.id === editingText.id);
    if (!s || s.type !== "text") return;
    const t = s as TextShape;
    const font = t.font ?? "12px Inter, system-ui, sans-serif";
    const pad = t.padding ?? 4;
    const txt = editingText.value;
    const x = toX(t.p.time),
      y = toY(t.p.price);
    if (x == null || y == null) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.font = font;
    ctx.textBaseline = "top";
    const w = ctx.measureText(txt).width;
    const h = getFontPx(font);
    let drawX = x;
    if (t.align === "center") drawX = x - w / 2;
    else if (t.align === "right") drawX = x - w;
    setEditingText((prev) =>
      prev && prev.id === t.id
        ? {
            ...prev,
            x: drawX - pad,
            y: y - pad,
            w: w + pad * 2,
            h: h + pad * 2,
          }
        : prev
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsDraw, projector, shapes]);

  const onPointerUp = (e: React.PointerEvent) => {
    // Brush tool: finalize brush shape
    if (
      creating.current &&
      "tool" in creating.current &&
      creating.current.tool === "brush" &&
      isPointerDown
    ) {
      const brush = creating.current;
      if (brush.points.length > 1) {
        const id = genId();
        const shape: BrushShape = {
          id,
          type: "brush",
          symbol,
          interval,
          points: [...brush.points],
          color: "#0ea5e9",
          width: 2,
          closed: false,
        };
        upsert(key, shape);
        select(id);
      }
      setIsPointerDown(false);
      creating.current = null;
      setNeedsDraw((n) => n + 1);
      return;
    }
    dragging.current = null;
  };

  // Delete key
  useEffect(() => {
    if (!editable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        creating.current = null;
        dragging.current = null;
        select(null);
        setActiveTool(null);
        setNeedsDraw((n) => n + 1);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        try {
          (deleteSelected as (k: string) => void)(key);
        } catch {
          try {
            (deleteSelected as () => void)();
          } catch {}
        }
        setNeedsDraw((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editable, selectedId, key, deleteSelected, select, setActiveTool]);

  return (
    <div
      className={`absolute inset-0 z-10 ${className ?? ""}`}
      style={{
        pointerEvents: overlayInteractive || !!editingText ? "auto" : "none",
      }}
      onDoubleClick={onDoubleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: overlayInteractive ? "pointer" : "default" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      {editingText && (
        <input
          autoFocus
          value={editingText.value}
          onChange={(e) =>
            setEditingText((prev) =>
              prev ? { ...prev, value: e.target.value } : prev
            )
          }
          onBlur={() => {
            // commit on blur
            const id = editingText.id;
            const nextVal = editingText.value;
            updateById(key, id, (prev) => ({
              ...(prev as TextShape),
              text: nextVal,
            }));
            setEditingText(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const id = editingText.id;
              const nextVal = editingText.value;
              updateById(key, id, (prev) => ({
                ...(prev as TextShape),
                text: nextVal,
              }));
              setEditingText(null);
            } else if (e.key === "Escape") {
              setEditingText(null);
            }
          }}
          style={{
            position: "absolute",
            left: editingText.x,
            top: editingText.y,
            width: editingText.w,
            height: editingText.h,
            zIndex: 20,
            padding: 4,
            border: "1px solid rgba(0,0,0,0.3)",
            borderRadius: 4,
            background: "rgba(255,255,255,0.95)",
            color: "#111827",
            font: "12px Inter, system-ui, sans-serif",
            outline: "none",
          }}
        />
      )}
    </div>
  );
}

// ===== helpers =====
function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, HANDLE_R, 0, Math.PI * 2);
  ctx.fill();
}

function getFontPx(font: string): number {
  const m = font.match(/(\d+)\s*px/i);
  return m ? parseInt(m[1], 10) : 12;
}

function absRound(n: number) {
  const v = Math.abs(n);
  if (v >= 1000) return v.toFixed(0);
  if (v >= 100) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(4);
}
function barsBetween(t1: number, t2: number, interval: string): number {
  const dt = Math.abs(t2 - t1); // seconds
  const sec = intervalToSeconds(interval);
  if (!sec) return Math.max(1, Math.round(dt / 60));
  return Math.max(1, Math.round(dt / sec));
}
function intervalToSeconds(intv: string): number {
  const presets: Record<string, number> = {
    "1m": 60,
    "3m": 180,
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "2h": 7200,
    "4h": 14400,
    "6h": 21600,
    "12h": 43200,
    "1d": 86400,
    "3d": 259200,
    "1w": 604800,
  };
  if (presets[intv]) return presets[intv];
  const m = intv.match(/^(\d+)\s*([mhdw])$/i);
  if (!m) return 60;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  if (u === "m") return n * 60;
  if (u === "h") return n * 3600;
  if (u === "d") return n * 86400;
  if (u === "w") return n * 604800;
  return 60;
}

function pointInQuad(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
) {
  return (
    pointInTri(px, py, x1, y1, x2, y2, x3, y3) ||
    pointInTri(px, py, x1, y1, x3, y3, x4, y4)
  );
}
function pointInTri(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
) {
  const v0x = cx - ax,
    v0y = cy - ay;
  const v1x = bx - ax,
    v1y = by - ay;
  const v2x = px - ax,
    v2y = py - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const inv = 1 / (dot00 * dot11 - dot01 * dot01 || 1);
  const u = (dot11 * dot02 - dot01 * dot12) * inv;
  const v = (dot00 * dot12 - dot01 * dot02) * inv;
  return u >= 0 && v >= 0 && u + v <= 1;
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
