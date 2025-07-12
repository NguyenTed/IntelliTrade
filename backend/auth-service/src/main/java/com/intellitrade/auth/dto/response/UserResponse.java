package com.intellitrade.auth.dto.response;

import lombok.Builder;

import java.util.Set;

@Builder
public record UserResponse (
    String id,
    String username,
    String email,
    boolean emailVerified,
    Set<RoleResponse> roles
) {}
