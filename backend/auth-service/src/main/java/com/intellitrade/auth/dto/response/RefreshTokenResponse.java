package com.intellitrade.auth.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

@Builder
public record RefreshTokenResponse(
        String accessToken,
        String refreshToken
) {
}
