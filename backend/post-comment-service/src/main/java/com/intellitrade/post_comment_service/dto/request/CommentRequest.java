package com.intellitrade.post_comment_service.dto.request;

import lombok.Data;

@Data
public class CommentRequest {
    private String article_id;
    private int parent_id;
    private String author;
    private String text;
}
