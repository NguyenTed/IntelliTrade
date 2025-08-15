import api from "../../api/axiosConfig";
import type { INews } from "../../interfaces/INews";
import type { NewsQuery, PageResponse } from "../../interfaces/IPage";

export const getTradingViewArticlesPaged = async (
  params?: NewsQuery
): Promise<PageResponse<INews>> => {
  const res = await api.get<PageResponse<INews>>("/post-comment/tradingview", {
    params,
  });
  return res.data;
};

export const getArticleBySlug = async (slug: string): Promise<INews> => {
  const res = await api.get<INews>(`/post-comment/${slug}`);
  return res.data;
};
