package com.intellitrade.auth.service;

import com.intellitrade.auth.dto.request.AuthenticationRequest;
import com.intellitrade.auth.dto.request.IntrospectRequest;
import com.intellitrade.auth.dto.request.LogoutRequest;
import com.intellitrade.auth.dto.request.RefreshTokenRequest;
import com.intellitrade.auth.dto.response.AuthenticationResponse;
import com.intellitrade.auth.dto.response.IntrospectResponse;
import com.intellitrade.auth.dto.response.RefreshTokenResponse;
import com.intellitrade.auth.entity.RefreshToken;
import com.intellitrade.auth.entity.User;
import com.intellitrade.auth.exception.AppException;
import com.intellitrade.auth.exception.ErrorCode;
import com.intellitrade.auth.repository.RefreshTokenRepository;
import com.intellitrade.auth.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class AuthenticationService {
    UserRepository userRepository;
    RefreshTokenRepository refreshTokenRepository;

    @NonFinal
    @Value("${jwt.signer-key}")
    public String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    public long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    public long REFRESHABLE_DURATION;

    public AuthenticationResponse authenticate(AuthenticationRequest request) throws NoSuchAlgorithmException {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        User user = userRepository
                .findByUsernameOrEmail(request.identifier())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.password(), user.getPassword());

        if (!authenticated)
            throw new AppException(ErrorCode.INCORRECT_PASSWORD);

        String accessToken = generateAccessToken(user);
        String rawRefreshToken = UUID.randomUUID().toString() + UUID.randomUUID();

        RefreshToken refreshToken = RefreshToken.builder()
                .id(UUID.randomUUID().toString())
                .userId(user.getId())
                .hashedToken(hashToken(rawRefreshToken))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(REFRESHABLE_DURATION))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .build();
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(request.accessToken());

            // Verify JWT signature
            JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
            if (!signedJWT.verify(verifier)) {
                log.warn("Token signature verification failed");
                return IntrospectResponse.builder().valid(false).build();
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            // Check expiration
            Date expirationTime = claims.getExpirationTime();
            if (expirationTime == null || expirationTime.before(new Date())) {
                log.warn("Token is expired");
                return IntrospectResponse.builder().valid(false).build();
            }

            // (Optional) Check issuer
            if (!"intellitrade.com".equals(claims.getIssuer())) {
                log.warn("Invalid issuer: {}", claims.getIssuer());
                return IntrospectResponse.builder().valid(false).build();
            }

            return IntrospectResponse.builder().valid(true).build();

        } catch (ParseException | JOSEException e) {
            log.warn("Token introspection failed: {}", e.getMessage());
            return IntrospectResponse.builder().valid(false).build();
        }
    }

    public RefreshTokenResponse refresh(RefreshTokenRequest request) throws NoSuchAlgorithmException {
        String hashedToken = hashToken(request.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByHashedToken(hashedToken)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Check if token is expired
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Revoke the old token
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Generate new access + refresh token pair
        String newAccessToken = generateAccessToken(user);

        String newRawRefreshToken = UUID.randomUUID().toString() + UUID.randomUUID();
        String newHashedRefreshToken = hashToken(newRawRefreshToken);

        RefreshToken newToken = RefreshToken.builder()
                .id(UUID.randomUUID().toString())
                .userId(stored.getUserId())
                .hashedToken(newHashedRefreshToken)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(REFRESHABLE_DURATION))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newToken);

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRawRefreshToken)
                .build();
    }

    public void logout(LogoutRequest request) throws NoSuchAlgorithmException {
        String hashedToken = hashToken(request.refreshToken());

        refreshTokenRepository.findByHashedToken(hashedToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("Refresh token revoked for user {}", token.getUserId());
                });
    }

    private String generateAccessToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("intellitrade.com")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS)))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

    private String hashToken(String rawToken) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
}
