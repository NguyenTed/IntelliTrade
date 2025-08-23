import type { TradeSide } from "../features/news/enums/TradeSide";
import type { IComment } from "./IComments";
import type { ISection } from "./ISection";
import type { ISymbol } from "./ISymbol";

export interface INews {
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
  tags: string[];
  symbols: ISymbol[];
  sections: ISection[];
  createdAt?: string | null;
  updatedAt?: string | null;
}
