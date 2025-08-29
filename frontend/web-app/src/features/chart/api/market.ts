// src/features/chart/api/market.ts
import { http } from "@/shared/api/createClient";

export type MarketSymbol = {
  id: string;
  name: string;           // e.g. "BTCUSDT"
  description: string;    // e.g. "Bitcoin / TetherUS"
  symbolImgs?: string[];  // 0..n icon URLs
};

type SymbolsResponse = {
  content: MarketSymbol[];
  // other paging fields ignored for now
};

export async function fetchSymbols(): Promise<MarketSymbol[]> {
  const { data } = await http.get<SymbolsResponse>("/market/symbols");
  return data?.content ?? [];
}