import { http } from "@/shared/api/createClient";
import type { BacktestRequest, BacktestResponse } from "../types/backtest";

export async function postBacktest(req: BacktestRequest): Promise<BacktestResponse> {
  // Force text so we can sanitize invalid JSON tokens coming from the server (NaN/Infinity)
  const res = await http.post<string>(
    "/backtest",
    req,
    {
      responseType: "text" as any,
      transformResponse: [(data) => data], // prevent axios from auto-parsing
    }
  );

  const raw = res.data ?? "";
  // Replace invalid JSON tokens with null before parsing
  const safe = raw
    .replace(/\bNaN\b/g, "null")
    .replace(/\b-Infinity\b/g, "null")
    .replace(/\bInfinity\b/g, "null");

  try {
    const parsed = JSON.parse(safe) as BacktestResponse;
    return parsed;
  } catch (e) {
    // Log a small slice for debugging, then throw a concise error
    console.error("Failed to parse backtest response", e, safe.slice(0, 300));
    throw new Error("Failed to parse backtest response");
  }
}