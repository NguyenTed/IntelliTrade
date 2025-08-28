// src/features/chart/store/drawing.store.ts
import { create } from "zustand";
import type { Shape, Tool } from "../types/drawing";

const EMPTY: Shape[] = Object.freeze([]);

type DrawingKey = string; // `${symbol}:${interval}`

type DrawingState = {
  activeTool: Tool | null;
  selectedId: string | null;
  shapes: Record<DrawingKey, Shape[]>;

  setActiveTool: (t: Tool | null) => void;
  select: (id: string | null) => void;

  load: (key: DrawingKey, items: Shape[]) => void;
  upsert: (key: DrawingKey, s: Shape) => void;
  remove: (key: DrawingKey, id: string) => void;
  replaceAll: (key: DrawingKey, items: Shape[]) => void;
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
  activeTool: null,
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
      return { shapes: { ...st.shapes, [key]: next } };
    }),

  replaceAll: (key, items) =>
    set((st) => ({ shapes: { ...st.shapes, [key]: items } })),

  getList: (key) => get().shapes[key] ?? EMPTY,

  deleteSelected: (key) =>
    set((st) => {
      const sel = st.selectedId;
      if (!sel) return st as any;
      const list = st.shapes[key] ?? EMPTY;
      const next = list.filter((x) => x.id !== sel);
      return {
        ...st,
        shapes: { ...st.shapes, [key]: next },
        selectedId: st.selectedId === sel ? null : st.selectedId,
      } as any;
    }),

  updateById: (key, id, updater) =>
    set((st) => {
      const list = st.shapes[key] ?? EMPTY;
      const next = list.map((x) => (x.id === id ? updater(x) : x));
      return { shapes: { ...st.shapes, [key]: next } } as any;
    }),

  getSelected: (key) => {
    const sel = get().selectedId;
    if (!sel) return null;
    const list = get().shapes[key] ?? EMPTY;
    return list.find((x) => x.id === sel) ?? null;
  },
}));