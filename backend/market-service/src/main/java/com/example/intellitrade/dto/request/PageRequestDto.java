package com.example.intellitrade.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PageRequestDto {
    @Min(0)
    private int page = 0;

    @Min(0)
    @Max(100)
    private int size = 12;

    private String sortBy = "name";
    private String sortDirection = "asc";
}
