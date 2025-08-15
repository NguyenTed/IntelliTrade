import type { INews } from "../../../../interfaces/INews";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";

export default function MetaRows({ data }: { data: INews }) {
  return (
    <div className="mt-4 flex items-center text-[14px] my-4">
      <div className="flex gap-1 items-center ">
        <SmsOutlinedIcon sx={{ fontSize: 14 }} />
        <span>{data.comments.length}</span>
      </div>
    </div>
  );
}
