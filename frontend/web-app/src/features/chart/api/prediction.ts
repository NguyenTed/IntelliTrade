// src/features/chart/api/prediction.ts
import { http } from "@/shared/api/createClient";
import type { Interval } from "../store/chart.store";

export type PredictionRequest = { symbol: string; interval: Interval };
export type PredictionResponse = {
  latest_close_price: number;
  predicted_close_price: number;
  symbol: string;
  trend: "UP" | "DOWN" | "FLAT" | string;
};

export async function fetchPrediction(
  params: PredictionRequest
): Promise<PredictionResponse> {
  // ✅ flat body (no nesting)
  const body = { symbol: params.symbol, interval: params.interval };
  const { data } = await http.post("/prediction", body, {
    headers: { "Content-Type": "application/json" },
  });
  // unwrap optional envelope
  const payload = (data && (data.result ?? data)) as PredictionResponse;
  return payload;
}