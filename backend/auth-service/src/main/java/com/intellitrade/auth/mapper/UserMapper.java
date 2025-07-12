package com.intellitrade.auth.mapper;

import com.intellitrade.auth.dto.request.UserCreationRequest;
import com.intellitrade.auth.dto.response.UserResponse;
import com.intellitrade.auth.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);
}
