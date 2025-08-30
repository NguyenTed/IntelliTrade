import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { PageResponse } from "../model/IPage";
import type { IArticles } from "../model/IArticles";
import { getNewsPaged } from "../api/GetNewsApi";
import NewsCard from "../components/news/NewsCard";
import { Pagination } from "../components/Pagination";
import Header from "@/shared/layouts/Header";
import Footer from "@/shared/layouts/Footer";

export default function NewsPage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResponse<IArticles>>(
    {} as PageResponse<IArticles>
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const getArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: PageResponse<IArticles> = await getNewsPaged({
          page,
          size: 16,
        });
        setData(res);
      } catch (err: any) {
        setError(err?.message ?? "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };
    getArticles();
  }, [page]);

  return (
    <div>
      <Header whiteSectionRef={whiteSectionRef} />
      <div ref={whiteSectionRef} className="max-w-full mx-auto px-[20px] py-8">
        <div className="my-20 text-center">
          <h1 className="text-[50px] font-bold mb-4">News</h1>
          <h3 className="text-[30px] font-medium">
            Don't miss a trick with global real-time updates.
          </h3>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border bg-white/5 p-4"
              >
                <div className="mb-3 flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-300" />
                  <div className="h-6 w-16 rounded-full bg-gray-300" />
                  <div className="h-6 w-6 rounded-full bg-gray-300" />
                  <div className="h-6 w-20 rounded-full bg-gray-300" />
                </div>
                <div className="h-6 w-3/4 rounded bg-gray-300" />
                <div className="mt-2 h-6 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {data.content?.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
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
        )}
      </div>
      <Footer />
    </div>
  );
}
