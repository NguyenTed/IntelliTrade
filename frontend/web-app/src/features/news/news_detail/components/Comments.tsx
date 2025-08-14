import { useState } from "react";
import type { IComment } from "../../../../interfaces/IComments";
import CommentItem from "./CommentItem";

type CommentMap = Record<number, IComment & { replies?: IComment[] }>;

export function Comments({ comments }: { comments: IComment[] }) {
  const [activeReplyId, setActiveReplyId] = useState<string>("");
  const commentMap: CommentMap = {};
  comments.forEach((c) => {
    commentMap[Number(c.comment_id)] = { ...c, replies: [] };
  });

  const topLevelComments: (IComment & { replies?: IComment[] })[] = [];

  comments.forEach((c) => {
    if (
      c.parent_id !== c.comment_id &&
      commentMap[Number(c.parent_id)] &&
      c.parent_id !== undefined
    ) {
      commentMap[Number(c.parent_id)].replies?.push(c);
    } else {
      topLevelComments.push(commentMap[Number(c.comment_id)]);
    }
  });

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[22px] font-bold">{comments.length} Comments</h2>
      </div>

      <div className="border rounded-lg p-3 bg-gray-50 text-gray-500 text-sm">
        Leave a comment that is helpful or encouraging. (disabled)
      </div>

      <div className="mt-4 space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          topLevelComments.map((c) => (
            <div key={c.comment_id}>
              {/* Comment cha */}
              <CommentItem
                comment={c}
                isReplyBoxOpen={activeReplyId === c.comment_id}
                onToggleReply={() =>
                  setActiveReplyId((prev) =>
                    prev === c.comment_id ? "" : c.comment_id
                  )
                }
              />

              {/* Các comment con (reply) */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-6 mt-3 space-y-2 border-l-2 border-gray-100 pl-2">
                  {c.replies.map((r) => (
                    <CommentItem
                      key={r.comment_id}
                      comment={r}
                      isReplyBoxOpen={activeReplyId === r.comment_id}
                      onToggleReply={() =>
                        setActiveReplyId((prev) =>
                          prev === r.comment_id ? "" : r.comment_id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
