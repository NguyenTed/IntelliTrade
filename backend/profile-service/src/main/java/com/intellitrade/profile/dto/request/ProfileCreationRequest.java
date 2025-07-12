package com.intellitrade.profile.dto.request;

import java.time.LocalDate;

public record ProfileCreationRequest (
        String username,
        String email,
        String lastName,
        String firstName,
        LocalDate dob,
        String userId
) {}
