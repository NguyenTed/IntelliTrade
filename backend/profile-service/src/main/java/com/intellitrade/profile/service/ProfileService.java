package com.intellitrade.profile.service;

import com.intellitrade.profile.dto.request.ProfileCreationRequest;
import com.intellitrade.profile.dto.response.ProfileResponse;
import com.intellitrade.profile.entity.Profile;
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
}
