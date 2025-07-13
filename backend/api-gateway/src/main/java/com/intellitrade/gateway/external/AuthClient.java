package com.intellitrade.gateway.external;

import com.intellitrade.gateway.dto.request.IntrospectRequest;
import com.intellitrade.gateway.dto.response.ApiResponse;
import com.intellitrade.gateway.dto.response.IntrospectResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.PostExchange;
import reactor.core.publisher.Mono;

public interface AuthClient {
    @PostExchange(url = "/auth/token/introspect", contentType = MediaType.APPLICATION_JSON_VALUE)
    Mono<ApiResponse<IntrospectResponse>> introspect(@RequestBody IntrospectRequest request);
}
