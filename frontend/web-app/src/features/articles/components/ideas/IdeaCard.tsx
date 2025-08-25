import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import SymbolImages from "../../components/SymbolImages";
import { TradeSide } from "@/enums/TradeSide";
import type { IArticles } from "../../model/IArticles";
export function IdeaCard({ item }: { item: IArticles }) {
  const image = item.imgUrl || "https://placehold.co/600x400/png?text=No+Image";
  const text = (item.content || []).join(" ");
  const symbolImgs = item.symbols[0].symbolImgs || [];

  return (
    <a
      href={`/ideas/${item.slug}`}
      rel="noopener noreferrer"
      className="block bg-white rounded hover:shadow-md transition overflow-hidden h-full"
    >
      <img src={image} alt={item.title} className="w-full auto object-cover" />
      <div className="p-4 h-auto flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold line-clamp-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{text}</p>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-2 items-center">
            <SymbolImages
              imgs={symbolImgs}
              size1={26}
              size2={24}
              iconGap={10}
            />
            {item.tradeSide == TradeSide.LONG ? (
              <div className="w-6 h-6 rounded-full bg-[#22AB94] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 18 18"
                  width="18"
                  height="18"
                >
                  <path
                    fill="white"
                    d="M12 4h2v8h-2V7.41l-7.3 7.3-1.4-1.42L10.58 6H6V4h6z"
                  ></path>
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#F7525F] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 18 18"
                  width="18"
                  height="18"
                >
                  <path
                    fill="white"
                    d="M3.3 4.7l7.29 7.3H6v2h8V6h-2v4.59l-7.3-7.3-1.4 1.42z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 hover:bg-gray-100 text-[16px] w-fit px-2 py-1 rounded-lg">
            <SmsOutlinedIcon sx={{ fontSize: 16 }} />
            <span className="text-black">{item.comments.length}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
