package com.intellitrade.gateway.dto.request;

import lombok.Builder;

@Builder
public record IntrospectRequest(
        String accessToken
) {}
