import { useEffect, useMemo, useState } from "react";
import type { IComment } from "../../../../interfaces/IComments";
import CommentItem from "./CommentItem";
import type { CreateCommentDto } from "../../../../interfaces/request/CreateCommentDto";
import { saveComment } from "../../../../services/news/SaveComment";
import { useArticleId } from "../../../../contexts/ArticleContext";

type CommentMap = Record<number, IComment & { replies?: IComment[] }>;

export function Comments({ comments }: { comments: IComment[] }) {
  const articleId = useArticleId();
  const [activeReplyId, setActiveReplyId] = useState<string>("");

  const [commentList, setCommentList] = useState<IComment[]>(comments);
  const { commentMap, topLevelComments } = useMemo(() => {
    const map: CommentMap = {};
    const tops: (IComment & { replies?: IComment[] })[] = [];

    commentList.forEach((c) => {
      map[Number(c.comment_id)] = { ...c, replies: [] };
    });

    commentList.forEach((c) => {
      if (
        c.parent_id !== c.comment_id &&
        map[Number(c.parent_id)] &&
        c.parent_id !== undefined
      ) {
        map[Number(c.parent_id)].replies?.push(c);
      } else {
        tops.push(map[Number(c.comment_id)]);
      }
    });

    return { commentMap: map, topLevelComments: tops };
  }, [commentList]);

  const handleReplySave = async (parentId: string, replyText: string) => {
    const newComment: CreateCommentDto = {
      article_id: articleId,
      parent_id: parentId,
      author: "Unknown",
      text: replyText,
    };

    try {
      const saved = await saveComment(newComment);
      setCommentList((prev) => [...prev, saved]);
      setActiveReplyId("");
    } catch (error) {
      console.error("❌ Failed to save comment:", error);
    }
  };

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[22px] font-bold">{commentList.length} Comments</h2>
      </div>

      <div className="border rounded-lg p-3 bg-gray-50 text-gray-500 text-sm">
        Leave a comment that is helpful or encouraging. (disabled)
      </div>

      <div className="mt-4 space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          topLevelComments.map((c) => (
            <div key={c.timestamp}>
              {/* Top level comments */}
              <CommentItem
                comment={c}
                isReplyBoxOpen={activeReplyId === c.timestamp}
                onToggleReply={() =>
                  setActiveReplyId((prev) =>
                    prev === c.timestamp ? "" : c.timestamp
                  )
                }
                onSave={(replyText) => {
                  handleReplySave(c.comment_id, replyText);
                  setActiveReplyId("");
                }}
              />

              {/* Reply comments */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-6 mt-3 space-y-2 border-l-2 border-gray-100 pl-2">
                  {c.replies.map((r) => (
                    <CommentItem
                      key={r.timestamp}
                      comment={r}
                      isReplyBoxOpen={activeReplyId === r.timestamp}
                      onToggleReply={() =>
                        setActiveReplyId((prev) =>
                          prev === r.timestamp ? "" : r.timestamp
                        )
                      }
                      onSave={(replyText) => {
                        handleReplySave(c.comment_id, replyText);
                      }}
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
