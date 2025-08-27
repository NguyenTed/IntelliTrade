import { http } from "@/shared/api/createClient";
import type { OHLC } from "../types/ohlc";
import type { Interval } from "../store/chart.store";

// DTO returned by /market/history
type HistoryCandleDto = {
  symbol: string;
  interval: string;
  openTime: number; // epoch millis
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closed: boolean;
};

function toOHLC(dto: HistoryCandleDto): OHLC {
  return {
    date: new Date(dto.openTime),
    open: Number(dto.open),
    high: Number(dto.high),
    low: Number(dto.low),
    close: Number(dto.close),
    volume: Number(dto.volume),
  };
}

export async function fetchOHLC(
  symbol: string,
  interval: Interval,
  limit = 1000,
): Promise<OHLC[]> {
  const res = await http.get<HistoryCandleDto[]>("/market/history", {
    params: { symbol, interval, limit },
  });

    const sorted = [...res.data].sort((a, b) => a.openTime - b.openTime);
  const deduped: HistoryCandleDto[] = [];
  const seen = new Set<number>();
  for (const c of sorted) {
    if (!seen.has(c.openTime)) { seen.add(c.openTime); deduped.push(c); }
  }

    const mapped = deduped
    .map(toOHLC)
    .filter((c) =>
      Number.isFinite(c.open) &&
      Number.isFinite(c.high) &&
      Number.isFinite(c.low) &&
      Number.isFinite(c.close) &&
      Number.isFinite(c.volume)
    );

    return mapped;
}