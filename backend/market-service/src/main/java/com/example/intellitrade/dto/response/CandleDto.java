package com.example.intellitrade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandleDto {
    private String symbol;
    private String interval;
    private long openTime;
    private double open;
    private double high;
    private double low;
    private double close;
    private double volume;
    private boolean closed;
}
