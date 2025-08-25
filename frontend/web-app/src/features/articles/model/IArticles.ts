import type { TradeSide } from "../enums/TradeSide";
import type { IComment } from "./IComments";
import type { ISection } from "./ISection";
import type { ISymbol } from "./ISymbol";

export interface IArticles {
  id: string;
  title: string;
  description: string;
  imgUrl: string;
  content: string[];
  comments: IComment[];
  url: string;
  slug: string;
  html: string;
  tradeSide: TradeSide;
  contentHtml: string;
  tags: string[];
  symbols: ISymbol[];
  sections: ISection[];
  createdAt?: string | null;
  updatedAt?: string | null;
}
