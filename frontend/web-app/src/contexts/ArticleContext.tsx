// src/contexts/ArticleContext.tsx
import { createContext, useContext } from "react";

export const ArticleContext = createContext<string | null>(null);

export const useArticleId = () => {
  const context = useContext(ArticleContext);
  if (context === null) {
    throw new Error("useArticleId must be used within <ArticleProvider>");
  }
  return context;
};
