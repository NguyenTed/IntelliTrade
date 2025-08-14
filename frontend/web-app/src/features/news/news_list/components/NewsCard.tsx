import type { INews } from "../../../../interfaces/INews";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
export function NewsCard({ item }: { item: INews }) {
  const image = item.imgUrl || "https://placehold.co/600x400/png?text=No+Image";
  const text = (item.content || []).join(" ");

  return (
    <a
      href={`news/${item.slug}`}
      rel="noopener noreferrer"
      className="block bg-white rounded hover:shadow-md transition overflow-hidden h-full"
    >
      <img src={image} alt={item.title} className="w-full auto object-cover" />
      <div className="p-4 h-auto flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold line-clamp-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{text}</p>
        </div>

        <div className="flex justify-end items-center mt-3">
          <div className="flex items-center gap-1 hover:bg-gray-100 text-[16px] w-fit px-2 py-1 rounded-lg">
            <SmsOutlinedIcon sx={{ fontSize: 16 }} />
            <span className="text-black">{item.comments.length}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
