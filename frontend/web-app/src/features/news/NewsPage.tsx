import { useEffect, useState, useMemo } from "react";

export interface TvNewsItem {
  id: string;
  title: string;
  imgUrl?: string | null;
  content: string[];
  url?: string;
}

const API_URL =
  import.meta.env.VITE_API_TRADINGVIEW_NEWS ??
  "http://localhost:8888/api/v1/post-comment/tradingview";

function getExcerpt(content: string[], maxChars = 180): string {
  const base = content.find((p) => p.trim()) ?? "";
  if (base.length <= maxChars) return base;
  const slice = base.slice(0, maxChars);
  return slice.slice(0, slice.lastIndexOf(" ")) + " …";
}

function NewsCard({ item }: { item: TvNewsItem }) {
  const image = item.imgUrl || "https://placehold.co/600x400/png?text=No+Image";
  const text = (item.content || []).join(" ");

  return (
    <a
      href={item.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded shadow hover:shadow-md transition overflow-hidden"
    >
      <img src={image} alt={item.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{text}</p>
      </div>
    </a>
  );
}

export default function NewsPage() {
  const [data, setData] = useState<TvNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        setData(Array.isArray(json) ? json : json?.content ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">News</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(loading ? Array.from({ length: 8 }) : data).map((item: any, idx) =>
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
            <NewsCard key={item.id} item={item} />
          )
        )}
      </div>
    </div>
  );
}
