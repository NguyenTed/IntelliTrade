package com.intellitrade.profile.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Node("user_profile")
public class Profile {
    @Id
    @GeneratedValue(generatorClass = UUIDStringGenerator.class)
    String id;

    String username;
    String email;

    String firstName;
    String lastName;
    LocalDate dob;

    @Property("userId")
    String userId;

    // ---- Premium projection (v1) ----
    Boolean premium;                 // computed: true if now in [premiumSince, premiumUntil)
    String planKey;                  // e.g., "PREMIUM_MONTHLY"
    OffsetDateTime premiumSince;     // subscription start
    OffsetDateTime premiumUntil;     // subscription end (exclusive)
}
