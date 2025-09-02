package com.intellitrade.profile.service;

import com.intellitrade.profile.dto.response.PremiumStatusResponse;
import com.intellitrade.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ProfileQueryService {
    private final ProfileRepository repo;
    private final Clock clock = Clock.systemUTC();

    public PremiumStatusResponse getPremiumStatus(String userId) {
        var profile = repo.findProfileByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for userId=" + userId));

        var now = OffsetDateTime.now(clock);
        boolean active = Boolean.TRUE.equals(profile.getPremium())
                && profile.getPremiumUntil() != null
                && now.isBefore(profile.getPremiumUntil());

        return new PremiumStatusResponse(
                active,
                active ? profile.getPlanKey() : null,
                active ? profile.getPremiumSince() : null,
                profile.getPremiumUntil()
        );
    }
}
