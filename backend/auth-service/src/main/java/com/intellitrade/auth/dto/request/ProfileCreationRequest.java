package com.intellitrade.auth.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCreationRequest {
    String username;
    String email;
    String lastName;
    String firstName;
    LocalDate dob;
    String userId;
}
