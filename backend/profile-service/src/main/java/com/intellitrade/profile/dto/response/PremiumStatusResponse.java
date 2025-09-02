package com.intellitrade.profile.dto.response;

import java.time.OffsetDateTime;

public record PremiumStatusResponse(
        boolean isPremium,
        String planKey,
        OffsetDateTime premiumSince,
        OffsetDateTime premiumUntil
) {}