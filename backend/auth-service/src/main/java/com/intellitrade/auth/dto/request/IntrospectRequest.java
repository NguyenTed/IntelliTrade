package com.intellitrade.auth.dto.request;

import lombok.Builder;

@Builder
public record IntrospectRequest(
        String accessToken
) {}
