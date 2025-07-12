package com.intellitrade.auth.dto.request;

import com.intellitrade.auth.validator.DobConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record UserCreationRequest (
        @Email(message = "INVALID_EMAIL")
        @NotBlank(message = "EMAIL_IS_REQUIRED")
        String email,

        @Size(min = 4, message = "USERNAME_INVALID")
        String username,

        @Size(min = 6, message = "INVALID_PASSWORD")
        String password,

        String firstName,
        String lastName,

        @DobConstraint(min = 10, message = "INVALID_DOB")
        LocalDate dob
) {}
