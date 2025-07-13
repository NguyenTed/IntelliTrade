package com.intellitrade.profile.controller.internal;

import com.intellitrade.profile.dto.request.ProfileCreationRequest;
import com.intellitrade.profile.dto.response.ApiResponse;
import com.intellitrade.profile.dto.response.ProfileResponse;
import com.intellitrade.profile.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
@RequestMapping("/internal")
public class InternalProfileController {
    ProfileService profileService;

    @PostMapping
    public ApiResponse<ProfileResponse> createProfile(@RequestBody ProfileCreationRequest profileCreationRequest) {
        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.createProfile(profileCreationRequest))
                .build();
    }
}
