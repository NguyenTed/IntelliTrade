package com.example.intellitrade.controller;

import com.example.intellitrade.dto.request.StartStreamRequest;
import com.example.intellitrade.dto.response.CandleDto;
import com.example.intellitrade.service.BinanceWebSocketReactiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/market")
@RequiredArgsConstructor
public class MarketController {

    private final BinanceWebSocketReactiveService wsService;

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
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<CandleDto> stream(@RequestParam String symbol,
                                  @RequestParam String interval) {
        return wsService.stream(symbol, interval);
    }

    /**
     * Lịch sử nến: mặc định 1000 nến, có thể truyền endTime (ms) để phân trang lùi.
     * Ví dụ: GET /api/market/history?symbol=BTCUSDT&interval=1m&limit=1000
     */
    @GetMapping("/history")
    public Flux<CandleDto> history(@RequestParam String symbol,
                                   @RequestParam String interval,
                                   @RequestParam(defaultValue = "1000") int limit,
                                   @RequestParam(required = false) Long endTime // milliseconds
    ) {
        return wsService.fetchHistory(symbol, interval, limit, endTime);
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
}
