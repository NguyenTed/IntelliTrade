// src/features/chart/api/realtimeClient.ts
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import type { Interval, Candle } from "../types/market"

const HUB_URL = import.meta.env.VITE_STOCKS_HUB_URL ?? "/stocks-feed";

const RT_LOG = () => (window as any).__log_rt__ !== false;

type GroupKey = string; // `${symbol}:${interval}`
type Subscriber = (u: Candle & { isFinal: boolean }) => void;

function keyOf(symbol: string, interval: Interval): GroupKey {
  return `${symbol}:${interval}`;
}

function toUTCSec(t: string | number | Date): number {
  if (typeof t === "number") {
    // if looks like ms epoch (>1e12), convert to seconds; else assume seconds
    return t > 1_000_000_000_000 ? Math.floor(t / 1000) : Math.floor(t);
  }
  const d = t instanceof Date ? t : new Date(t);
  return Math.floor(d.getTime() / 1000);
}

// --- Singleton hub client
class RealtimeClient {
  private conn: HubConnection | null = null;
  private ready: Promise<void> | null = null;
  private subs = new Map<GroupKey, Set<Subscriber>>();
  private refs = new Map<GroupKey, number>();

  async ensureStarted(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise(async (resolve, reject) => {
      try {
        if (RT_LOG()) console.debug("[RT] building connection", HUB_URL);
        const c = new HubConnectionBuilder()
          .withUrl(HUB_URL /* , { accessTokenFactory: () => authStore.getState().accessToken ?? "" } */)
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build();

        c.on("ReceiveStockPriceUpdate", (raw: any) => this.onRawUpdate(raw));

        c.onreconnecting((err) => {
          if (RT_LOG()) console.warn("[RT] reconnecting", err?.message ?? "");
        });
        c.onreconnected((id) => {
          if (RT_LOG()) console.info("[RT] reconnected", id);
          this.rejoinAll();
        });
        c.onclose((err) => {
          if (RT_LOG()) console.warn("[RT] closed", err?.message ?? "");
          this.conn = null;
          this.ready = null;
        });

        this.conn = c;
        if (RT_LOG()) console.debug("[RT] starting connection…");
        await c.start();
        if (RT_LOG()) console.debug("[RT] started");
        resolve();
      } catch (e) {
        this.ready = null;
        if (RT_LOG()) console.error("[RT] start error", (e as any)?.message ?? e);
        reject(e);
      }
    });
    return this.ready;
  }

  private normalize(raw: any): Candle & { symbol: string; interval: Interval; isFinal: boolean } {
    const symbol = String(raw.Symbol ?? raw.symbol);
    const interval = String(raw.Interval ?? raw.interval) as Interval;
    const open = Number(raw.Open ?? raw.open);
    const high = Number(raw.High ?? raw.high);
    const low = Number(raw.Low ?? raw.low);
    const close = Number(raw.Close ?? raw.close);
    const volume = Number(raw.Volume ?? raw.volume ?? 0);
    const isFinal = Boolean(raw.IsFinal ?? raw.isFinal);
    const time = toUTCSec(raw.Time ?? raw.time);
    return { symbol, interval, time, open, high, low, close, volume, isFinal };
  }

  private onRawUpdate(raw: any) {
    try {
      if (RT_LOG()) console.debug("[RT] recv", raw);
      const u = this.normalize(raw);
      const k = keyOf(u.symbol, u.interval);
      const listeners = this.subs.get(k);
      if (!listeners?.size) return;
      const payload: Candle & { isFinal: boolean } = {
        time: u.time,
        open: u.open,
        high: u.high,
        low: u.low,
        close: u.close,
        volume: u.volume,
        isFinal: u.isFinal,
      };
      for (const fn of listeners) fn(payload);
    } catch (e) {
      if (RT_LOG()) console.error("[RT] onRawUpdate error", (e as any)?.message ?? e, raw);
    }
  }

  private async rejoinAll() {
    if (!this.conn) return;
    for (const k of this.refs.keys()) {
      const [symbol, interval] = k.split(":");
      try {
        if (RT_LOG()) console.debug("[RT] rejoin", { symbol, interval });
        await this.conn.invoke("JoinStockGroup", symbol, interval);
      } catch (e) {
        if (RT_LOG()) console.error("[RT] rejoin error", (e as any)?.message ?? e);
      }
    }
  }

  async join(symbol: string, interval: Interval, cb: Subscriber): Promise<() => void> {
    await this.ensureStarted();
    const k = keyOf(symbol, interval);

    // subscribe cb
    if (!this.subs.has(k)) this.subs.set(k, new Set());
    this.subs.get(k)!.add(cb);

    // ref-count group membership
    const count = (this.refs.get(k) ?? 0) + 1;
    this.refs.set(k, count);
    if (count === 1) {
      try {
        if (RT_LOG()) console.debug("[RT] JoinStockGroup", { symbol, interval });
        await this.conn!.invoke("JoinStockGroup", symbol, interval);
        if (RT_LOG()) console.debug("[RT] joined group", { symbol, interval });
      } catch (e) {
        if (RT_LOG()) console.error("[RT] JoinStockGroup error", (e as any)?.message ?? e);
      }
    } else {
      if (RT_LOG()) console.debug("[RT] ref++", { k, count });
    }

    return async () => {
      // unsubscribe cb
      const set = this.subs.get(k);
      if (set) {
        set.delete(cb);
        if (set.size === 0) this.subs.delete(k);
      }

      // reduce refs and leave group if zero
      const next = (this.refs.get(k) ?? 1) - 1;
      if (next <= 0) {
        this.refs.delete(k);
        try {
          if (RT_LOG()) console.debug("[RT] LeaveStockGroup", { symbol, interval });
          await this.conn?.invoke("LeaveStockGroup", symbol, interval);
        } catch (e) {
          if (RT_LOG()) console.error("[RT] LeaveStockGroup error", (e as any)?.message ?? e);
        }
      } else {
        this.refs.set(k, next);
        if (RT_LOG()) console.debug("[RT] ref--", { k, next });
      }
    };
  }
}

export const realtimeClient = new RealtimeClient();