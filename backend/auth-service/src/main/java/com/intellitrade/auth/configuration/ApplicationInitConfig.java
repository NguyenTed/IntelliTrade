package com.intellitrade.auth.configuration;

import com.intellitrade.auth.constant.PredefinedRole;
import com.intellitrade.auth.entity.Role;
import com.intellitrade.auth.entity.User;
import com.intellitrade.auth.repository.RoleRepository;
import com.intellitrade.auth.repository.UserRepository;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Configuration
@Slf4j
public class ApplicationInitConfig {
    @NonFinal
    static final String ADMIN_USERNAME = "admin";

    @NonFinal
    static final String ADMIN_EMAIL = "admin@intellitrade.com";

    @NonFinal
    static final String ADMIN_PASSWORD = "123456789";


    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository,
                                        RoleRepository roleRepository,
                                        PasswordEncoder passwordEncoder) {
        return args -> {
            log.info("Initializing application.....");

            try {
                if (userRepository.findByEmail(ADMIN_EMAIL).isEmpty()) {
                    roleRepository.save(Role.builder()
                            .name(PredefinedRole.USER_ROLE)
                            .description("User role")
                            .build());

                    Role adminRole = roleRepository.save(Role.builder()
                            .name(PredefinedRole.ADMIN_ROLE)
                            .description("Admin role")
                            .build());

                    var roles = new HashSet<Role>();
                    roles.add(adminRole);

                    User user = User.builder()
                            .username(ADMIN_USERNAME)
                            .email(ADMIN_EMAIL)
                            .emailVerified(true)
                            .password(passwordEncoder.encode(ADMIN_PASSWORD))
                            .roles(roles)
                            .build();

                    userRepository.save(user);
                    log.warn("Admin user has been created with default password: 123456789, please change it");
                }
            } catch (Exception e) {
                log.error("💥 ApplicationRunner failed", e);
            }
        };
    }
}

