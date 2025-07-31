package com.intellitrade.post_comment_service.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class PageResponseDto<T> {
    private List<T> content;
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

}
