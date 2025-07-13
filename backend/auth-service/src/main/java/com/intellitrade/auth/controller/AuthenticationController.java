package com.intellitrade.auth.controller;

import com.intellitrade.auth.dto.request.AuthenticationRequest;
import com.intellitrade.auth.dto.request.IntrospectRequest;
import com.intellitrade.auth.dto.request.LogoutRequest;
import com.intellitrade.auth.dto.request.RefreshTokenRequest;
import com.intellitrade.auth.dto.response.ApiResponse;
import com.intellitrade.auth.dto.response.AuthenticationResponse;
import com.intellitrade.auth.dto.response.IntrospectResponse;
import com.intellitrade.auth.dto.response.RefreshTokenResponse;
import com.intellitrade.auth.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.NoSuchAlgorithmException;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
@RequestMapping("/token")
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping()
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest authenticationRequest) throws NoSuchAlgorithmException {
        System.out.println("Authentication request: " + authenticationRequest);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.authenticate(authenticationRequest))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest introspectRequest) {
        System.out.println("Introspect request token: " + introspectRequest.accessToken());
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(introspectRequest))
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<RefreshTokenResponse> refresh(@RequestBody RefreshTokenRequest refreshTokenRequest) throws NoSuchAlgorithmException {
        return ApiResponse.<RefreshTokenResponse>builder()
                .result(authenticationService.refresh(refreshTokenRequest))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logOut(@RequestBody LogoutRequest logoutRequest) throws NoSuchAlgorithmException {
        authenticationService.logout(logoutRequest);
        return ApiResponse.<Void>builder().build();
    }
}
