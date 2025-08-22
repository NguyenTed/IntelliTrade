package com.example.intellitrade.service;

import com.example.intellitrade.dto.response.CandleDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.netty.http.client.HttpClient;
import reactor.netty.http.client.WebsocketClientSpec;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class BinanceWebSocketReactiveService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, Sinks.Many<CandleDto>> sinks = new ConcurrentHashMap<>();
    private final Map<String, Disposable> liveConnections = new ConcurrentHashMap<>();
    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://api.binance.com")
            .build();

    private String key(String symbol, String interval) {
        return symbol.toUpperCase() + "@" + interval;
    }

    /** SSE stream cho FE subscribe */
    public Flux<CandleDto> stream(String symbol, String interval) {
        final String k = key(symbol, interval);
        // tạo sink nếu chưa có
        sinks.computeIfAbsent(k, s -> Sinks.many().multicast().onBackpressureBuffer());
        // đảm bảo đã mở websocket
        ensureSocket(symbol, interval);
        // trả về Flux cho FE
        return sinks.get(k)
                .asFlux()
                .onBackpressureBuffer()
                .doOnSubscribe(sub -> log.info("👤 FE subscribed: {}", k))
                .doFinally(sig -> log.info("👋 FE unsubscribed: {} ({})", k, sig));
    }

    /** Đảm bảo có kết nối WS đang chạy cho symbol@interval */
    public synchronized void ensureSocket(String symbol, String interval) {
        final String k = key(symbol, interval);
        if (liveConnections.containsKey(k) && !liveConnections.get(k).isDisposed()) {
            return; // đã chạy
        }

        String lowerSymbol = symbol.toLowerCase();
        String endpoint = String.format("wss://stream.binance.com:9443/ws/%s@kline_%s", lowerSymbol, interval);

        Disposable disposable = HttpClient.create()
                .websocket(WebsocketClientSpec.builder().build())
                .uri(endpoint)
                .handle((inbound, outbound) -> {
                    inbound.aggregateFrames().receive().asString().doOnNext(message -> {
                        try {
                            JsonNode json = objectMapper.readTree(message);
                            JsonNode kline = json.get("k");
                            if (kline != null) {
                                CandleDto candle = new CandleDto(
                                        symbol.toUpperCase(),
                                        interval,
                                        kline.get("t").asLong(),
                                        kline.get("o").asDouble(),
                                        kline.get("h").asDouble(),
                                        kline.get("l").asDouble(),
                                        kline.get("c").asDouble(),
                                        kline.get("v").asDouble(),
                                        kline.get("x").asBoolean()
                                );
                                sinks.computeIfAbsent(k, s -> Sinks.many().multicast().onBackpressureBuffer())
                                        .tryEmitNext(candle);
                                log.info("📈 New candle: {}", candle);
                            }
                        } catch (Exception e) {
                            log.error("❌ Error parsing message: ", e);
                        }
                    }).subscribe();

                    return Mono.never(); // giữ kết nối mở
                })
                .doOnError(e -> log.error("❌ WebSocket error [{}]: ", k, e))
                // Reconnect khi lỗi với delay cố định 3s (có thể tăng maxBackoff)
                .retryWhen(Retry.fixedDelay(Long.MAX_VALUE, java.time.Duration.ofSeconds(3)))
                // Nếu stream complete (ít khi xảy ra), tự đăng ký lại
                .repeat()
                .subscribe();

        liveConnections.put(k, disposable);
        log.info("🔌 WebSocket started for {}", k);
    }

    /** Dừng stream (tuỳ chọn) */
    public void stop(String symbol, String interval) {
        String k = key(symbol, interval);
        Optional.ofNullable(liveConnections.remove(k)).ifPresent(Disposable::dispose);
        log.info("🛑 Stopped stream {}", k);
    }

    /** Lấy lịch sử nến từ Binance REST */
    public Flux<CandleDto> fetchHistory(String symbol, String interval, int limit, Long endTimeMs) {
        // /api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000[&endTime=...]
        return webClient.get()
                .uri(uri -> {
                    var b = uri.path("/api/v3/klines")
                            .queryParam("symbol", symbol.toUpperCase())
                            .queryParam("interval", interval)
                            .queryParam("limit", Math.min(Math.max(limit, 1), 1000)); // Binance max 1000/req
                    if (endTimeMs != null) b.queryParam("endTime", endTimeMs);
                    return b.build();
                })
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(List.class)
                .flatMapMany(list -> Flux.fromIterable((List<?>) list))
                .map(row -> {
                    // mỗi item là List<Object> theo thứ tự Binance
                    List<?> a = (List<?>) row;
                    long openTime = ((Number) a.get(0)).longValue();
                    double open = Double.parseDouble(String.valueOf(a.get(1)));
                    double high = Double.parseDouble(String.valueOf(a.get(2)));
                    double low  = Double.parseDouble(String.valueOf(a.get(3)));
                    double close= Double.parseDouble(String.valueOf(a.get(4)));
                    double volume = Double.parseDouble(String.valueOf(a.get(5)));
                    boolean isClose = true; // lịch sử luôn đóng nến
                    return new CandleDto(symbol.toUpperCase(), interval, openTime, open, high, low, close, volume, isClose);
                });
    }
}
