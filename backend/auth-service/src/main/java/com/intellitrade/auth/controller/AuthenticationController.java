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
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
@RequestMapping("/token")
public class AuthenticationController {
    AuthenticationService authenticationService;

    private ResponseCookie devRefreshCookie(String value) {
        return ResponseCookie.from("refresh_token", value)
                .httpOnly(true)
                .secure(false)                          // http dev
                .sameSite("Lax")                        // same-origin via Vite proxy
                .path("/api/v1/auth/token/refresh")     // <-- BROWSER path (gateway path)
                .maxAge(2592000)                        // e.g., 30 days
                .build();
    }

    @PostMapping()
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest authenticationRequest, HttpServletResponse resp) throws NoSuchAlgorithmException {
        var tokens = authenticationService.authenticate(authenticationRequest);

        // Set refresh cookie on success only
        resp.addHeader(HttpHeaders.SET_COOKIE, devRefreshCookie(tokens.refreshToken()).toString());

        return ApiResponse.<AuthenticationResponse>builder()
                    .result(AuthenticationResponse.builder()
                            .accessToken(tokens.accessToken())
                            .build())
                    .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest introspectRequest) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(introspectRequest))
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refresh(
            @CookieValue(name = "refresh_token", required = false) String rt,
            @RequestBody(required = false) RefreshTokenRequest body,
            HttpServletResponse resp
    ) throws NoSuchAlgorithmException {

        // Prefer cookie; allow body fallback (e.g., mobile/CLI).
        String supplied = (body != null && body.refreshToken() != null) ? body.refreshToken() : rt;

        if (supplied == null || supplied.isBlank()) {
            // Best practice: 401 for missing/invalid refresh token; do NOT alter cookies here.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<RefreshTokenResponse>builder()
                            .code(1401)
                            .message("No refresh token")
                            .build());
        }

        var rotated = authenticationService.refresh(new RefreshTokenRequest(supplied));

        // Rotate cookie on success with identical attributes to login
        resp.addHeader(HttpHeaders.SET_COOKIE, devRefreshCookie(rotated.refreshToken()).toString());

        return ResponseEntity.ok(
                ApiResponse.<RefreshTokenResponse>builder()
                        .result(RefreshTokenResponse.builder()
                                .accessToken(rotated.accessToken())
                                .build())
                        .build()
        );
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logOut(@CookieValue(name = "refresh_token", required = false) String rt,
                                    @RequestBody(required = false) LogoutRequest logoutRequest,
                                    HttpServletResponse resp) throws NoSuchAlgorithmException {

        String supplied = (logoutRequest != null && logoutRequest.refreshToken() != null)
                ? logoutRequest.refreshToken() : rt;
        if (supplied != null && !supplied.isBlank()) {
            authenticationService.logout(LogoutRequest.builder()
                            .accessToken("")
                            .refreshToken(supplied)
                    .build());
        }

        // Clear cookie explicitly on logout
        ResponseCookie clear = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(false).sameSite("Lax")
                .path("/api/v1/auth/token/refresh").maxAge(0)
                .build();
        resp.addHeader(HttpHeaders.SET_COOKIE, clear.toString());

        return ApiResponse.<Void>builder().build();
    }
}
