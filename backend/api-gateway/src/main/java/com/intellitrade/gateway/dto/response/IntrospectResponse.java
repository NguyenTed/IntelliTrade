package com.intellitrade.gateway.dto.response;

import lombok.Builder;

@Builder
public record IntrospectResponse(
        boolean valid
) {}
