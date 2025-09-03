package com.intellitrade.profile.controller;

import com.intellitrade.profile.dto.request.ProfileUpdateRequest;
import com.intellitrade.profile.dto.response.ApiResponse;
import com.intellitrade.profile.dto.response.ProfileResponse;
import com.intellitrade.profile.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
public class ProfileController {
    ProfileService profileService;

    @GetMapping("/{profileId}")
    public ApiResponse<ProfileResponse> getProfileById(@PathVariable String profileId) {
        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.getProfileById(profileId))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<ProfileResponse> getCurrentUserProfile(Authentication authentication) {
        String userId = authentication.getName();

        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.getProfileByUserId(userId))
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<ProfileResponse> updateProfile(Authentication authentication, @RequestBody ProfileUpdateRequest request) {
        String userId = authentication.getName();

        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.updateProfile(userId, request))
                .build();
    }
}
