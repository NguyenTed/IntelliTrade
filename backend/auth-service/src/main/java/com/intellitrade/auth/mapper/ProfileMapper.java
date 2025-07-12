package com.intellitrade.auth.mapper;

import com.intellitrade.auth.dto.request.ProfileCreationRequest;
import com.intellitrade.auth.dto.request.UserCreationRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest userCreationRequest);
}
