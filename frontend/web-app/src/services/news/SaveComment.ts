import api from "../../api/axiosConfig";
import type { IComment } from "../../interfaces/IComments";
import type { CreateCommentDto } from "../../interfaces/request/CreateCommentDto";

export const saveComment = async (
  comment: CreateCommentDto
): Promise<IComment> => {
  try {
    const res = await api.post<IComment>("/post-comment/comment", comment);
    return res.data;
  } catch (error: any) {
    console.error(
      "❌ Failed to post comment:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
