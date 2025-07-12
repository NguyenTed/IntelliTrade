package com.intellitrade.auth.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

@Builder
public record IntrospectResponse(
        boolean valid
) {}
