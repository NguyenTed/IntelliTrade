package com.intellitrade.auth.dto.request;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

@Builder
public record LogoutRequest(
        String accessToken,
        String refreshToken
) {
}
