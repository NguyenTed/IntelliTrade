import { Link } from "react-router-dom";
import type { IArticles } from "../../model/IArticles";

export default function NewsCard({ item }: { item: IArticles }) {
  const uniqueImages: string[] = Array.from(
    new Set(item.symbols?.flatMap((s) => s.symbolImgs) || [])
  );

  return (
    <div className="group relative rounded-2xl  bg-white/5 pl-1 pr-4 py-2 transition hover:bg-gray-100">
      {/* Symbol stacked images */}
      <div className="mb-3 flex items-center">
        {uniqueImages.map((src, idx) => (
          <SymbolImage key={src} src={src} index={idx} />
        ))}
      </div>

      {/* Title */}
      <Link
        to={item.slug ? `/news/${item.slug}` : "#"}
        className="block text-[16px]  leading-snug "
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
