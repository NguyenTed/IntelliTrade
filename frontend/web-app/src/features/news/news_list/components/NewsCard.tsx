import type { IArticles } from "../../../../interfaces/IArticles";
import { Link } from "react-router-dom";

export default function ArticleCard({ item }: { item: IArticles }) {
  const uniqueImages: string[] = Array.from(
    new Set(item.symbols?.flatMap((s) => s.symbolImgs) || [])
  );

  return (
    <div className="group relative rounded-2xl  bg-white/5 p-4 transition hover:bg-gray-100">
      {/* Symbol stacked images */}
      <div className="mb-3 flex items-center">
        {uniqueImages.map((src, idx) => (
          <SymbolImage key={src} src={src} index={idx} />
        ))}
      </div>

      {/* Title */}
      <Link
        to={item.slug ? `/news/${item.slug}` : "#"}
        className="block text-lg font-medium leading-snug "
      >
        {item.title}
      </Link>
    </div>
  );
}

function SymbolImage({ src, index }: { src: string; index: number }) {
  return (
    <img
      src={src}
      alt=""
      className={`h-6 w-6 rounded-full object-cover border-2 border-white -ml-2 ${
        index === 0 ? "ml-0" : ""
      }`}
    />
  );
}
