package com.intellitrade.profile.mapper;

import com.intellitrade.profile.dto.request.ProfileCreationRequest;
import com.intellitrade.profile.dto.response.ProfileResponse;
import com.intellitrade.profile.entity.Profile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    Profile toProfile(ProfileCreationRequest profileCreationRequest);
    ProfileResponse toProfileResponse(Profile profile);
}
