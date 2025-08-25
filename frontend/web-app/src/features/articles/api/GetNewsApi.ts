import { http } from "@/shared/api/createClient";
import type { IArticles } from "../model/IArticles";
import type { ArticlesQuery, PageResponse } from "../model/IPage";

export const getNewsPaged = async (
  params?: ArticlesQuery
): Promise<PageResponse<IArticles>> => {
  const res = await http.get<PageResponse<IArticles>>(
    "/post-comment/tradingview/news",
    { params }
  );
  return res.data;
};

export const getNewsBySlug = async (slug: string): Promise<IArticles> => {
  const res = await http.get<IArticles>(`/post-comment/news/${slug}`);
  return res.data;
};
