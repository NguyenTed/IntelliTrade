package com.intellitrade.profile.service;

import com.intellitrade.profile.dto.request.UpsertPremiumRequest;
import com.intellitrade.profile.entity.Profile;
import com.intellitrade.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class PremiumService {

    private final ProfileRepository profileRepository;

    /**
     * Prefer injecting a Clock for testability. If you already have a @Bean Clock,
     * switch this to constructor injection and remove the default.
     */
    private final Clock clock = Clock.systemUTC();

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

        OffsetDateTime startDate = req.startDate().toInstant().atOffset(ZoneId.systemDefault().getRules().getOffset(req.startDate().toInstant()));
        OffsetDateTime endDate = req.endDate().toInstant().atOffset(ZoneId.systemDefault().getRules().getOffset(req.endDate().toInstant()));

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
        if (req.startDate().after(req.endDate()))
            throw new IllegalArgumentException("startDate must be <= endDate");
    }

    private boolean isActiveNow(OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null) return false;
        OffsetDateTime now = OffsetDateTime.now(clock);
        // Active when now ∈ [start, end)
        return !now.isBefore(start) && now.isBefore(end);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}