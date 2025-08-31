package com.intellitrade.gateway.service;

import com.intellitrade.gateway.dto.request.IntrospectRequest;
import com.intellitrade.gateway.dto.response.ApiResponse;
import com.intellitrade.gateway.dto.response.IntrospectResponse;
import com.intellitrade.gateway.external.AuthClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class AuthService {
    AuthClient authClient;

    public Mono<ApiResponse<IntrospectResponse>> introspect(IntrospectRequest request) {
        return authClient.introspect(request);
    }
}