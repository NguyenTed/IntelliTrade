import type { ArticleTypes } from "../enums/ArticleType";

export interface ISymbol {
  id: string;
  name: string;
  source: ArticleTypes;
  symbolImgs: string[];
}
