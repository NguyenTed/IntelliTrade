package com.intellitrade.profile.dto.response;

import lombok.Builder;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Builder
public record ProfileResponse(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        LocalDate dob,
        String userId,
        Boolean premium,
        String planKey,
        OffsetDateTime premiumSince,
        OffsetDateTime premiumUntil
) {
}
