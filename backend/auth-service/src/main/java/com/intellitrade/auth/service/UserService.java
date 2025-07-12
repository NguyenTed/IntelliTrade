package com.intellitrade.auth.service;

import com.intellitrade.auth.constant.PredefinedRole;
import com.intellitrade.auth.dto.request.UserCreationRequest;
import com.intellitrade.auth.dto.response.UserResponse;
import com.intellitrade.auth.entity.Role;
import com.intellitrade.auth.entity.User;
import com.intellitrade.auth.exception.AppException;
import com.intellitrade.auth.exception.ErrorCode;
import com.intellitrade.auth.mapper.UserMapper;
import com.intellitrade.auth.repository.RoleRepository;
import com.intellitrade.auth.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
        user.setEmailVerified(false);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        List<User> users = userRepository.findAll();

        return users.stream().map(userMapper::toUserResponse).toList();
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUserById(String userId) {
        userRepository.deleteById(userId);
    }
}
