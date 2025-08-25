import { http } from "@/shared/api/createClient";
import type { ArticlesQuery, PageResponse } from "../model/IPage";
import type { IArticles } from "../model/IArticles";

export const getTradingViewIdeasPaged = async (
  params?: ArticlesQuery
): Promise<PageResponse<IArticles>> => {
  const res = await http.get<PageResponse<IArticles>>(
    "/post-comment/tradingview/ideas",
    {
      params,
    }
  );
  return res.data;
};

export const getIdeaBySlug = async (slug: string): Promise<IArticles> => {
  const res = await http.get<IArticles>(`/post-comment/ideas/${slug}`);
  return res.data;
};
