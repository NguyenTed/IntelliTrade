package com.intellitrade.auth.repository;

import com.intellitrade.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByHashedToken(String token);

    void deleteByHashedToken(String token);

    void deleteAllByUserId(String userId);
}
