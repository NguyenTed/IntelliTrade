package com.intellitrade.auth.service;

import com.intellitrade.auth.constant.PredefinedRole;
import com.intellitrade.auth.dto.request.ProfileCreationRequest;
import com.intellitrade.auth.dto.request.UserCreationRequest;
import com.intellitrade.auth.dto.response.UserResponse;
import com.intellitrade.auth.entity.Role;
import com.intellitrade.auth.entity.User;
import com.intellitrade.auth.exception.AppException;
import com.intellitrade.auth.exception.ErrorCode;
import com.intellitrade.auth.external.ProfileClient;
import com.intellitrade.auth.mapper.ProfileMapper;
import com.intellitrade.auth.mapper.UserMapper;
import com.intellitrade.auth.repository.RoleRepository;
import com.intellitrade.auth.repository.UserRepository;
import com.intellitrade.event.dto.NotificationEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
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
    ProfileClient profileClient;
    UserMapper userMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;
    KafkaTemplate<String, Object> kafkaTemplate;

    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
        user.setEmailVerified(false);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        ProfileCreationRequest profileCreationRequest = profileMapper.toProfileCreationRequest(request);
        profileCreationRequest.setUserId(user.getId());
        profileClient.createProfile(profileCreationRequest);

        UserResponse userResponse = userMapper.toUserResponse(user);

        String body = "Hello " + request.username();

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(request.email())
                .subject("Welcome to Intelli Trade - Number 1 Trading platform with AI power")
                .body(body)
                .build();

        kafkaTemplate.send("notification-delivery", notificationEvent);

        return userResponse;
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
