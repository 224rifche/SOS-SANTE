package com.wonmally.app.user.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Builder
public record UserAdminResponseDTO(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String phone,
    Set<String> roles,
    boolean enabled,
    boolean verified,
    LocalDateTime lastLogin,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}