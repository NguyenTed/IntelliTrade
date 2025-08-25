import { http } from "@/shared/api/createClient";
import type { CreateCommentDto } from "../model/CreateCommentDto";
import type { IComment } from "../model/IComments";

export const saveComment = async (
  comment: CreateCommentDto
): Promise<IComment> => {
  try {
    const res = await http.post<IComment>("/post-comment/comment", comment);
    return res.data;
  } catch (error: any) {
    console.error(
      "Failed to post comment:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
