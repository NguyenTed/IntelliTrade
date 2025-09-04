import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { IArticles } from "../model/IArticles";
import { getNewsBySlug } from "../api/GetNewsApi";
import MetaShare from "../components/news/MetaShare";
import SymbolRow from "../components/news/SymbolRow";
import NewsContent from "../components/news/NewsContent";
import NewsTags from "../components/news/NewsTags";
import Header from "@/shared/layouts/Header";

// ===== util helpers =====
function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220)); // ~220 wpm
}

// function formatDate(dt?: string | Date | null) {
//   if (!dt) return "";
//   const d = new Date(dt);
//   if (isNaN(d.getTime())) return "";
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

export default function NewsDetailPage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const { slug = "" } = useParams();
  const [data, setData] = useState<IArticles | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await getNewsBySlug(slug);
        setData(res);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [slug]);

  const allText = useMemo(() => {
    if (!data) return "";
    if (data.contentHtml) {
      const stripped = data.contentHtml.replace(/<[^>]*>/g, " ");
      return stripped;
    }
    return (data.content ?? []).join(" ");
  }, [data]);

  const readMin = useMemo(() => estimateReadMinutes(allText), [allText]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 h-7 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mb-2 h-12 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-12 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-7 animate-pulse rounded-full bg-gray-200"
            />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-full animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          ← Back to News
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <Header whiteSectionRef={whiteSectionRef} />
      <div className="mx-auto max-w-3xl px-4 py-10 mt-10" ref={whiteSectionRef}>
        <img
          src="https://s3.tradingview.com/news/logo/tradingview--theme-light.svg"
          alt=""
        />
        {/* Title */}
        <h1 className="mb-3 text-[48px] font-bold ">{data.title}</h1>

        {/* Meta + share */}
        <MetaShare data={data} minRead={readMin} />

        {/* Symbol row*/}
        <SymbolRow symbols={data.symbols} />

        {/* Content */}
        <NewsContent contentHtml={data.contentHtml} />

        {/* Tags */}
        <NewsTags tags={data.tags} />
      </div>
    </div>
  );
}
