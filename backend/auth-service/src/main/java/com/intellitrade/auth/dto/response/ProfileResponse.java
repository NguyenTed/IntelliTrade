package com.intellitrade.auth.dto.response;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ProfileResponse(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        LocalDate dob,
        String userId
) {
}
