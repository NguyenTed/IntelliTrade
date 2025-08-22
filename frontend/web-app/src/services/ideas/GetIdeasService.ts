import api from "../../api/axiosConfig";
import type { IArticles } from "../../interfaces/IArticles";
import type { ArticlesQuery, PageResponse } from "../../interfaces/IPage";

export const getTradingViewIdeasPaged = async (
  params?: ArticlesQuery
): Promise<PageResponse<IArticles>> => {
  const res = await api.get<PageResponse<IArticles>>(
    "/post-comment/tradingview/ideas",
    {
      params,
    }
  );
  return res.data;
};

export const getIdeaBySlug = async (slug: string): Promise<IArticles> => {
  const res = await api.get<IArticles>(`/post-comment/ideas/${slug}`);
  return res.data;
};
