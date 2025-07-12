package com.intellitrade.auth.dto.request;

import lombok.*;

@Builder
public record AuthenticationRequest (
        String identifier,
        String password
) {}
