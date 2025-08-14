import type { IComment } from "./IComments";
import type { ISection } from "./ISection";

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
  tags: string[];
  symbols: string[];
  sections: ISection[];
  createdAt?: string | null;
  updatedAt?: string | null;
}
