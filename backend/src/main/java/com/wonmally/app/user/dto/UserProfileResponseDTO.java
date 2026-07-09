package com.wonmally.app.user.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Builder
public record UserProfileResponseDTO(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String phone,
    String profilePicture,
    Set<String> roles,
    Set<String> permissions,
    boolean enabled,
    boolean verified,
    LocalDateTime lastLogin,
    LocalDateTime createdAt
) {}
