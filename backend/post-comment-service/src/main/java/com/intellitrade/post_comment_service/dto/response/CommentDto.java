package com.intellitrade.post_comment_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CommentDto {
    private String id;
    private Integer comment_id;
    private Integer parent_id;
    private String author;
    private String text;
    private String timestamp;
}
