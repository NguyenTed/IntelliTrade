import type { ArticleTypes } from "../features/news/enums/ArticleType";

export interface ISymbol {
  id: string;
  name: string;
  source: ArticleTypes;
  symbolImgs: string[];
}
