export type Trend = "UP" | "DOWN" | "NEUTRAL";

export type PredictionResponse = {
  latest_close_price: number;
  predicted_close_price: number;
  symbol: string;
  interval: string;
  trend: Trend; // server sends "UP"/"DOWN"; treat unknown as "NEUTRAL"
};

export type PanelPrediction = {
  latest: number;
  predicted: number;
  delta: number;
  deltaPct: number;
  trend: Trend;
  at: number;           // Date.now() for freshness/debug
};