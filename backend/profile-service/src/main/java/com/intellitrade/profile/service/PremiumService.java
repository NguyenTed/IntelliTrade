package com.intellitrade.profile.service;

import com.intellitrade.profile.dto.request.UpsertPremiumRequest;
import com.intellitrade.profile.entity.Profile;
import com.intellitrade.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.Instant;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class PremiumService {

    private final ProfileRepository profileRepository;

    /**
     * Prefer injecting a Clock for testability. If you already have a @Bean Clock,
     * switch this to constructor injection and remove the default.
     */
    private final Clock clock = Clock.systemUTC();

    @Value("${premium.clock-skew-seconds:0}")
    private long clockSkewSeconds; // Positive moves 'now' forward, negative moves it back

    /**
     * Idempotent upsert called by Payment service.
     * - Validates payload
     * - Updates projection fields on Profile
     * - Computes premium flag using current time
     */
    @Transactional
    public Void apply(UpsertPremiumRequest req) {
        validate(req);

        Profile p = profileRepository.findProfileByUserId(req.userId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for userId=" + req.userId()));

        // Inputs are now UTC-normalized by Payment. No additional shifting is required.
        OffsetDateTime startDate = req.startDate().toInstant().atOffset(ZoneOffset.UTC);
        OffsetDateTime endDate   = req.endDate().toInstant().atOffset(ZoneOffset.UTC);

        // Preserve original subscription duration
        Duration originalDuration = Duration.between(startDate, endDate);
        if (originalDuration.isZero() || originalDuration.isNegative()) {
            throw new IllegalArgumentException("endDate must be after startDate (UTC)");
        }

        // If start is in the future due to clock skew or provider timestamp, clamp to now and keep the same duration
        OffsetDateTime nowUtc = OffsetDateTime.now(clock);
        if (startDate.isAfter(nowUtc)) {
            OffsetDateTime clampedStart = nowUtc;
            OffsetDateTime clampedEnd = clampedStart.plus(originalDuration);
            // Log once; replace with proper logger if available
            System.out.println("[PremiumService] Clamped start from " + startDate + " to " + clampedStart + 
                               ", end adjusted to " + clampedEnd + " to preserve duration " + originalDuration);
            startDate = clampedStart;
            endDate = clampedEnd;
        }

        p.setPlanKey(req.subscriptionType());
        p.setPremiumSince(startDate);
        p.setPremiumUntil(endDate);
        p.setPremium(isActiveNow(startDate, endDate));

        profileRepository.save(p);

        return null;
    }

    /**
     * Recomputes the premium flag for a user from stored dates.
     * Useful if you want a daily job or an on-demand recompute.
     */
    @Transactional
    public void recomputePremiumFlag(String userId) {
        Profile p = profileRepository.findProfileByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for userId=" + userId));

        p.setPremium(isActiveNow(p.getPremiumSince(), p.getPremiumUntil()));
        profileRepository.save(p);
    }

    private void validate(UpsertPremiumRequest req) {
        if (req == null) throw new IllegalArgumentException("Request is required");
        if (isBlank(req.userId())) throw new IllegalArgumentException("userId is required");
        if (isBlank(req.subscriptionType())) throw new IllegalArgumentException("subscriptionType is required");
        if (req.startDate() == null || req.endDate() == null)
            throw new IllegalArgumentException("startDate and endDate are required");
    }

    private boolean isActiveNow(OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null) return false;
        Instant now = Instant.now(clock).plusSeconds(clockSkewSeconds);
        System.out.println("clockSkewSeconds: " + clockSkewSeconds);
        System.out.println("now: " + now);
        System.out.println("start: " + start.toInstant());
        System.out.println("end: " + end.toInstant());
        System.out.println("result: " + (!now.isBefore(start.toInstant()) && now.isBefore(end.toInstant())));

        // Active when now ∈ [start, end)
        return !now.isBefore(start.toInstant()) && now.isBefore(end.toInstant());
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}