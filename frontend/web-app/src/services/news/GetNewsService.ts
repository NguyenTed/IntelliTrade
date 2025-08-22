import api from "../../api/axiosConfig";
import type { IArticles } from "../../interfaces/IArticles";

import type { ArticlesQuery, PageResponse } from "../../interfaces/IPage";

export const getNewsPaged = async (
  params?: ArticlesQuery
): Promise<PageResponse<IArticles>> => {
  const res = await api.get<PageResponse<IArticles>>(
    "/post-comment/tradingview/news",
    { params }
  );
  return res.data;
};

export const getNewsBySlug = async (slug: string): Promise<IArticles> => {
  const res = await api.get<IArticles>(`/post-comment/news/${slug}`);
  return res.data;
};
