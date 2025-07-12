package com.intellitrade.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "refresh_tokens",
        indexes = {
        @Index(name = "idx_refresh_token_user_id", columnList = "userId")})
public class RefreshToken {
    @Id
    @Column(nullable = false, updatable = false)
    String id;

    @Column(nullable = false, unique = true, length = 512)
    String hashedToken;

    @Column(nullable = false)
    String userId;

    @Column(nullable = false)
    Instant issuedAt;

    @Column(nullable = false)
    Instant expiresAt;

    @Column(nullable = false)
    boolean revoked = false;
}
