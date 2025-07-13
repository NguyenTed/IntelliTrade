package com.intellitrade.profile.controller;

import com.intellitrade.profile.dto.response.ApiResponse;
import com.intellitrade.profile.dto.response.ProfileResponse;
import com.intellitrade.profile.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
}
