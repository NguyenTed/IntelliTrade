import { useState } from "react";
import type { IComment } from "../../../../interfaces/IComments";
import { highlightMentions } from "../../../../utils/HighLightMentions";
import DefaultAvatar from "../../../../views/components/DefaultAvartar";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";

export default function CommentItem({
  comment,
  isReplyBoxOpen = false,
  onToggleReply,
}: {
  comment: IComment;
  isReplyBoxOpen: boolean;
  onToggleReply: () => void;
}) {
  const [reply, setReply] = useState(`@${comment.author}, `);
  return (
    <div className="rounded-lg p-3 bg-white">
      <div className="flex gap-2">
        <DefaultAvatar size={36} />
        <div className="flex flex-col justify-between items-start">
          <p className="text-[12px] font-bold">{comment.author}</p>
          <p className="text-xs text-gray-500">
            {new Date(comment.timestamp).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-700">
        {highlightMentions(comment.text)}
      </p>
      <button
        onClick={onToggleReply}
        className="mt-1 flex gap-1 items-center px-3 py-1.5 hover:bg-gray-200 rounded-lg transition-all duration-100 ease-in-out"
      >
        <SmsOutlinedIcon sx={{ fontSize: 14 }} className="text-black" />
        <span className="text-sm text-black">
          {isReplyBoxOpen ? "Close" : "Reply"}
        </span>
      </button>

      {isReplyBoxOpen && (
        <div className="mt-2">
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
            }}
          />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1.5 text-sm rounded-lg bg-black text-white hover:opacity-90">
              Send
            </button>
            <button
              onClick={onToggleReply}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
