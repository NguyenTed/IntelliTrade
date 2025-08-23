export const TradeSide = {
  SHORT: "short",
  LONG: "long",
} as const;

export type TradeSide = (typeof TradeSide)[keyof typeof TradeSide];
