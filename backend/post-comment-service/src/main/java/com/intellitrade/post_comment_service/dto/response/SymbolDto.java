package com.intellitrade.post_comment_service.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SymbolDto {
    String id;
    String name;
    String source;
    List<String> symbolImgs;
}
