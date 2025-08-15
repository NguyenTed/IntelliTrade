import type { INews } from "../../../../interfaces/INews";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import SymbolImages from "../../components/SymbolImages";
import TradeSideBadge from "./TradeSideBadge";
const fallbackImg = "https://placehold.co/1200x630/png?text=No+Image";
export default function NewsHeader({ data }: { data: INews }) {
  const img = data.imgUrl || fallbackImg;
  return (
    <div>
      <div className="flex gap-4 items-center">
        <SymbolImages
          imgs={data.symbols[0].symbolImgs}
          size1={10}
          size2={8}
          iconGap={4}
        />
        {data.symbols.length > 0 && (
          <div className="text-[25px] font-medium">{data.symbols[0].name}</div>
        )}

        <TradeSideBadge tradeSide={data.tradeSide} />
      </div>

      <div className="flex items-end justify-between mb-3">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {data.title}
        </h1>

        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <LinkOutlinedIcon sx={{ fontSize: 16 }} />
            Original
          </a>
        )}
      </div>

      <div className="mt-4 w-full overflow-hidden rounded-lg">
        <img
          src={img}
          alt={data.title}
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
