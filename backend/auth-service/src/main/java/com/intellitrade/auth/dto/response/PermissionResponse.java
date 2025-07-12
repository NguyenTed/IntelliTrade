package com.intellitrade.auth.dto.response;

import lombok.Builder;

@Builder
public record PermissionResponse (
        String name,
        String description
) {}
