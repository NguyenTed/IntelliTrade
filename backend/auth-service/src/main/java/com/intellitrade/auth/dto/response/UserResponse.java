package com.intellitrade.auth.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Builder
public record UserResponse (
    String id,
    String username,
    String email,
    boolean emailVerified,
    Set<RoleResponse> roles
) {}
