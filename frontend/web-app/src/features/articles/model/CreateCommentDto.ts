export interface CreateCommentDto {
  article_id: string;
  parent_id: string | null;
  author: string;
  text: string;
}
