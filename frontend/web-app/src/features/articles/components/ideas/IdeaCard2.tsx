import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import type { IArticles } from "../../model/IArticles";
import { TradeSide } from "@/enums/TradeSide";

export function IdeaCard2({ item }: { item: IArticles }) {
  const image = item.imgUrl || "https://placehold.co/600x400/png?text=No+Image";
  const text = (item.content || []).join(" ");
  const symbols = item.symbols || [];

  return (
    <a
      href={`/ideas/${item.slug}`}
      rel="noopener noreferrer"
      className="flex flex-col lg:flex-row gap-3 rounded-xl p-3 hover:bg-[#F2F2F2] transition bg-white"
    >
      <div className="order-2 flex-1 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
            IDEA
          </span>

          {symbols.length > 0 && (
            <div className="flex items-center gap-2  border-2 border-gray-200 bg-gray-200 rounded-sm">
              <div className="flex -space-x-2">
                {symbols[0].symbolImgs?.slice(0, 2).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="symbol"
                    className={`w-4 h-4 rounded-full object-cover z-${
                      idx === 0 ? "z-20" : "z-10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">{symbols[0].name}</span>
            </div>
          )}
          {item.tradeSide == TradeSide.LONG ? (
            <span className="bg-[#CFE5DA] text-[#004D27]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  fill="currentColor"
                  d="M9 5h10v10h-2V8.41L6.7 18.71l-1.4-1.42L15.58 7H9V5Z"
                ></path>
              </svg>
            </span>
          ) : (
            <span className="bg-[#ECD5D7] text-[#99202A] rounded-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  fill="currentColor"
                  d="M5.3 6.7 15.58 17H9v2h10V9h-2v6.59L6.7 5.29 5.3 6.71Z"
                ></path>
              </svg>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold line-clamp-2">{item.title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{text}</p>

        {/* Author + Time
        <p className="text-xs text-gray-500 mt-1">
          By <span className="font-medium">{item.author}</span> •{" "}
          {item.createdAt}
        </p> */}

        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <SmsOutlinedIcon fontSize="small" />
            {item.comments?.length ?? 0}
          </div>
        </div>
      </div>

      <img
        src={image}
        alt={item.title}
        className="order-1 w-[60%] lg:w-[40%] rounded object-cover"
      />
    </a>
  );
}
