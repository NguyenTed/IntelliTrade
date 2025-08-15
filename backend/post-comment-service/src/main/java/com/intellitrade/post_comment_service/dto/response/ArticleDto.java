package com.intellitrade.post_comment_service.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleDto {
    private String id;
    private String title;
    private String description;
    private String imgUrl;
    private List<String> content;
    private List<CommentDto> comments;
    private String url;
    private String slug;
    private String tradeSide;
    private List<String> tags;
    private List<SymbolDto> symbols;
    private List<Object> sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
