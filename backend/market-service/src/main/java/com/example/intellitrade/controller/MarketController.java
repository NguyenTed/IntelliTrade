package com.example.intellitrade.controller;

import com.example.intellitrade.dto.request.PageRequestDto;
import com.example.intellitrade.dto.request.StartStreamRequest;
import com.example.intellitrade.dto.response.CandleDto;
import com.example.intellitrade.dto.response.PageResponseDto;
import com.example.intellitrade.model.Symbol;
import com.example.intellitrade.service.BinanceWebSocketReactiveService;
import com.example.intellitrade.service.CandleCacheService;
import com.example.intellitrade.service.SymbolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.jaxb.SpringDataJaxb;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/market")
@RequiredArgsConstructor
public class MarketController {

    private final BinanceWebSocketReactiveService wsService;
    private final CandleCacheService cacheService;
    @Autowired
    private final SymbolService symbolService;

    /**
     * FE gọi để bắt đầu stream (tuỳ chọn — nếu FE subscribe SSE thì tự động ensure).
     */
    @PostMapping("/stream/start")
    public ResponseEntity<String> start(@RequestBody StartStreamRequest req) {
        wsService.ensureSocket(req.getSymbol(), req.getInterval());
        return ResponseEntity.accepted().body(
                "Started stream for " + req.getSymbol().toUpperCase() + "@" + req.getInterval()
        );
    }

    /**
     * SSE realtime: FE subscribe endpoint này để nhận nến liên tục.
     * Ví dụ: GET /api/market/stream?symbol=BTCUSDT&interval=1m
     */
    @GetMapping(value = "/stream/{symbol}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<CandleDto> stream(@RequestParam String symbol,
                                  @RequestParam String interval) {
        return wsService.stream(symbol, interval);
    }

    /**
     * Lịch sử nến: mặc định 1000 nến, có thể truyền endTime (ms) để phân trang lùi.
     * Ví dụ: GET /api/market/history?symbol=BTCUSDT&interval=1m&limit=1000
     */
    @GetMapping("/history/{symbol}")
    public Flux<CandleDto> history(@PathVariable String symbol,
                                   @RequestParam String interval,
                                   @RequestParam(defaultValue = "1000") int limit,
                                   @RequestParam(required = false) Long startTime,
                                   @RequestParam(required = false) Long endTime) {
        return cacheService.getCache(symbol, interval, limit, startTime, endTime)
                .filter(list -> list != null && !list.isEmpty())
                .flatMapMany(Flux::fromIterable)
                .switchIfEmpty(
                        wsService.fetchHistory(symbol, interval, limit, startTime, endTime)
                                .collectList()
                                .flatMap(candles -> cacheService.setCache(symbol, interval, limit, startTime, endTime, candles)
                                        .thenReturn(candles))
                                .flatMapMany(Flux::fromIterable)
                );
    }

    /**
     * Dừng stream (optional).
     */
    @PostMapping("/stream/stop")
    public ResponseEntity<String> stop(@RequestBody StartStreamRequest req) {
        wsService.stop(req.getSymbol(), req.getInterval());
        return ResponseEntity.ok("Stopped stream for " + req.getSymbol().toUpperCase()
                + "@" + req.getInterval());
    }

    @GetMapping("/symbols")
    public ResponseEntity<PageResponseDto<Symbol>> getSymbols(@Valid PageRequestDto pageRequestDto) {
        PageResponseDto<Symbol> symbols = symbolService.getSymbols(pageRequestDto);
        if (symbols.getContent().isEmpty()) {
            return new ResponseEntity<>(symbols, HttpStatus.NO_CONTENT);
        } else return new ResponseEntity<>(symbols, HttpStatus.OK);
    }
}
