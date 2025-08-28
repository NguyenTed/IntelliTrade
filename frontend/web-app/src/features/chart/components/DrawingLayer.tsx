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
} from "../types/drawing";
import { saveDrawings, loadDrawings } from "../utils/drawing.persistence";

type Props = {
  symbol: string;
  interval: string;
  projector: ChartProjector;
  editable: boolean; // only active chart is editable
  className?: string;
};

const HANDLE_R = 5; // px
const HIT_TOL = 6; // px for line picking

export default function DrawingLayer({
  symbol,
  interval,
  projector,
  editable,
  className,
}: Props) {
  // --- Per-chart-instance isolation ---
  // Each mounted chart panel gets its own id so drawings don't leak across panels
  // that share the same symbol:interval (e.g., multiple BTCUSDT:1m charts).
  const instanceIdRef = useRef<string>(genId());
  const storageSymbol = `${symbol}::${instanceIdRef.current}`;
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
  const creating = useRef<null | {
    tool: "trendline" | "ray" | "rect";
    p1: PricePoint;
  }>(null);
  const dragging = useRef<null | {
    id: string;
    mode: "move" | "p1" | "p2";
    anchor: PricePoint;
  }>(null);
  // Only capture events when a tool is active or a gesture is in progress
  const overlayInteractive =
    editable &&
    (!!activeTool ||
      activeTool === "select" ||
      !!creating.current ||
      !!dragging.current);

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
      }

      // Draw preview during creation (trendline, ray, rect)
      if (creating.current) {
        const tool = creating.current.tool;
        const p1 = creating.current.p1;
        const p2 = hoverPoint.current;
        const x1 = toX(p1.time),
          y1 = toY(p1.price);
        const x2 = p2 ? toX(p2.time) : null,
          y2 = p2 ? toY(p2.price) : null;
        if (x1 != null && y1 != null && x2 != null && y2 != null) {
          ctx.strokeStyle = "#94a3b8"; // slate-400
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          if (tool === "rect") {
            const x = Math.min(x1, x2),
              y = Math.min(y1, y2);
            const w = Math.abs(x2 - x1),
              h = Math.abs(y2 - y1);
            ctx.rect(x, y, w, h);
          } else {
            // trendline or ray: show segment preview
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.stroke();
          ctx.setLineDash([]);
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
      if (s.type === "rect") {
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

    // If creating with tool
    if (
      activeTool === "trendline" ||
      activeTool === "ray" ||
      activeTool === "rect" ||
      activeTool === "hline"
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

      if (!creating.current) {
        const p1 = {
          time: projector.xToTime(mx) ?? 0,
          price: projector.yToPrice(my) ?? 0,
        };
        const tool =
          activeTool === "rect"
            ? "rect"
            : activeTool === "ray"
            ? "ray"
            : "trendline";
        creating.current = { tool, p1 };
        e.preventDefault(); // start of gesture
      } else {
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
        if (s.type === "hline") {
          s.price = p;
          return s as Shape;
        }
        if (s.type === "rect") {
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
        // trendline or ray
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

  const onPointerUp = () => {
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
      style={{ pointerEvents: overlayInteractive ? "auto" : "none" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: overlayInteractive ? "pointer" : "default" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}

// ===== helpers =====
function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, HANDLE_R, 0, Math.PI * 2);
  ctx.fill();
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
