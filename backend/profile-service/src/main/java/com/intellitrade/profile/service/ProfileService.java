package com.intellitrade.profile.service;

import com.intellitrade.profile.dto.request.ProfileCreationRequest;
import com.intellitrade.profile.dto.request.UpsertPremiumRequest;
import com.intellitrade.profile.dto.response.ProfileResponse;
import com.intellitrade.profile.entity.Profile;
import com.intellitrade.profile.exception.AppException;
import com.intellitrade.profile.exception.ErrorCode;
import com.intellitrade.profile.mapper.ProfileMapper;
import com.intellitrade.profile.repository.ProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class ProfileService {
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;

    public ProfileResponse createProfile(ProfileCreationRequest request) {
        Profile profile = profileMapper.toProfile(request);
        profileRepository.save(profile);

        return profileMapper.toProfileResponse(profile);
    }

    public ProfileResponse getProfileById(String id) {
        Profile profile = profileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return profileMapper.toProfileResponse(profile);
    }

    public ProfileResponse getProfileByUserId(String userId) {
        Profile profile = profileRepository.findProfileByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return profileMapper.toProfileResponse(profile);
    }
}
