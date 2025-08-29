// src/features/chart/utils/drawing.persistence.ts
import type { Shape } from "../types/drawing";

const keyFor = (symbol: string, interval: string) =>
  `drawings:${symbol}:${interval}`;

export function loadDrawings(symbol: string, interval: string): Shape[] {
  try {
    const raw = localStorage.getItem(keyFor(symbol, interval));
    return raw ? (JSON.parse(raw) as Shape[]) : [];
  } catch {
    return [];
  }
}

export function saveDrawings(symbol: string, interval: string, shapes: Shape[]) {
  try {
    localStorage.setItem(keyFor(symbol, interval), JSON.stringify(shapes));
  } catch {
    /* ignore quota errors */
  }
}