package com.example.intellitrade.service;

import com.example.intellitrade.dto.response.CandleDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandleCacheService {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    private String buildKey(String symbol, String interval, int limit, Long startTime, Long endTime) {
        return String.format("candles:%s:%s:%d:%s:%s",
                symbol.toUpperCase(),
                interval,
                limit,
                startTime != null ? startTime : "null",
                endTime != null ? endTime : "null"
        );
    }

    public Mono<List<CandleDto>> getCache(String symbol, String interval, int limit, Long startTime, Long endTime) {
        String key = buildKey(symbol, interval, limit, startTime, endTime);
        return redisTemplate.opsForValue()
                .get(key)
                .cast(List.class)
                .map(list -> {
                    log.info("✅ Cache HIT for key {}", key);
                    return (List<CandleDto>) list;
                })
                .switchIfEmpty(Mono.fromRunnable(() -> {
                    log.info("❌ Cache MISS for key {}", key);
                }));
    }

    public Mono<Boolean> setCache(String symbol, String interval, int limit, Long startTime, Long endTime, List<CandleDto> data) {
        String key = buildKey(symbol, interval, limit, startTime, endTime);
        log.info("📥 Caching {} candles into Redis with key {}", data.size(), key);
        return redisTemplate.opsForValue()
                .set(key, data, Duration.ofSeconds(60))
                .doOnNext(success -> {
                    if (success) {
                        log.info("✅ Cache SET success for key {}", key);
                    } else {
                        log.warn("⚠️ Cache SET failed for key {}", key);
                    }
                });
    }
}
