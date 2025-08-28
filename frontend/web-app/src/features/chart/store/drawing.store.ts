// src/features/chart/store/drawing.store.ts
import { create } from "zustand";
import type { Shape, Tool } from "../types/drawing";

const EMPTY: Shape[] = Object.freeze([]);

type DrawingKey = string; // `${symbol}::panel-${chartId}:${interval}`

type DrawingState = {
  activeTool: Tool | "select" | "deleteAll" | null;
  selectedId: string | null;
  shapes: Record<DrawingKey, Shape[]>;

  setActiveTool: (t: Tool | "select" | "deleteAll" | null) => void;
  select: (id: string | null) => void;

  load: (key: DrawingKey, items: Shape[]) => void;
  upsert: (key: DrawingKey, s: Shape) => void;
  remove: (key: DrawingKey, id: string) => void;
  replaceAll: (key: DrawingKey, items: Shape[]) => void;
  clearAll: (key: DrawingKey) => void;
  getList: (key: DrawingKey) => Shape[];
  deleteSelected: (key: DrawingKey) => void;
  updateById: (
    key: DrawingKey,
    id: string,
    updater: (prev: Shape) => Shape
  ) => void;
  getSelected: (key: DrawingKey) => Shape | null;
};

export const useDrawingStore = create<DrawingState>((set, get) => ({
  activeTool: null as Tool | "select" | "deleteAll" | null,
  selectedId: null,
  shapes: {},

  setActiveTool: (t) =>
    set((st) => ({ activeTool: st.activeTool === t ? null : t })),
  select: (id) => set({ selectedId: id }),

  load: (key, items) =>
    set((st) => ({ shapes: { ...st.shapes, [key]: items } })),

  upsert: (key, s) =>
    set((st) => {
      const arr = st.shapes[key] ?? [];
      const i = arr.findIndex((x) => x.id === s.id);
      const next = i >= 0 ? [...arr.slice(0, i), s, ...arr.slice(i + 1)] : [...arr, s];
      return { shapes: { ...st.shapes, [key]: next } };
    }),

  remove: (key, id) =>
    set((st) => {
      const next = (st.shapes[key] ?? []).filter((x) => x.id !== id);
      const selCleared = st.selectedId === id ? null : st.selectedId;
      return { shapes: { ...st.shapes, [key]: next }, selectedId: selCleared };
    }),

  replaceAll: (key, items) =>
    set((st) => ({ shapes: { ...st.shapes, [key]: items } })),

  clearAll: (key) =>
    set((st) => ({ shapes: { ...st.shapes, [key]: [] }, selectedId: null })),

  getList: (key) => get().shapes[key] ?? EMPTY,

  deleteSelected: (key) =>
    set((st) => {
      const sel = st.selectedId;
      if (!sel) return st;
      const list = st.shapes[key] ?? EMPTY;
      const next = list.filter((x) => x.id !== sel);
      return {
        ...st,
        shapes: { ...st.shapes, [key]: next },
        selectedId: st.selectedId === sel ? null : st.selectedId,
      };
    }),

  updateById: (key, id, updater) =>
    set((st) => {
      const list = st.shapes[key] ?? EMPTY;
      const next = list.map((x) => (x.id === id ? updater(x) : x));
      return { shapes: { ...st.shapes, [key]: next } };
    }),

  getSelected: (key) => {
    const sel = get().selectedId;
    if (!sel) return null;
    const list = get().shapes[key] ?? EMPTY;
    return list.find((x) => x.id === sel) ?? null;
  },
}));