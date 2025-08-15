import { useEffect, useState } from "react";
import type { INews } from "../../../interfaces/INews";
import { NewsCard } from "./components/NewsCard";
import { useSearchParams } from "react-router-dom";
import type { PageResponse } from "../../../interfaces/IPage";
import { getTradingViewArticlesPaged } from "../../../services/news/GetNewsService";
import { Pagination } from "../../../views/components/Pagination";

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResponse<INews>>(
    {} as PageResponse<INews>
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const getArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: PageResponse<INews> = await getTradingViewArticlesPaged({
          page,
        });
        setData(res);
      } catch (err: any) {
        setError(err?.message ?? "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };
    getArticles();
  }, [page]);

  return (
    <div className="max-w-full mx-auto px-[20px] py-8">
      <h1 className="text-[50px] font-bold mb-4 text-center ">News</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(loading ? Array.from({ length: 8 }) : data.content).map(
          (item: any, idx) =>
            loading ? (
              <div
                key={idx}
                className="animate-pulse bg-gray-100 rounded shadow overflow-hidden"
              >
                <div className="h-40 bg-gray-300" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 w-3/4 rounded" />
                  <div className="h-3 bg-gray-300 w-full rounded" />
                  <div className="h-3 bg-gray-300 w-5/6 rounded" />
                </div>
              </div>
            ) : (
              <div>
                <NewsCard key={item.id} item={item} />
              </div>
            )
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={data.totalPages}
        onPageChange={(newPage) =>
          setSearchParams({ page: newPage.toString() })
        }
        hasNext={data.hasNext}
        hasPrevious={data.hasPrevious}
      />
    </div>
  );
}
