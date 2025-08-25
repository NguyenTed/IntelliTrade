export const ArticleTypes = {
  VNEXPRESS: "vnexpress",
  TRADINGVIEW: "tradingview",
} as const;

export type ArticleTypes = (typeof ArticleTypes)[keyof typeof ArticleTypes];
