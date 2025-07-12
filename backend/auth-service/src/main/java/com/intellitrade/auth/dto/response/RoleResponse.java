package com.intellitrade.auth.dto.response;

import lombok.Builder;

import java.util.Set;

@Builder
public record RoleResponse (
        String name,
        String description,
        Set<PermissionResponse> permissions
) {}
