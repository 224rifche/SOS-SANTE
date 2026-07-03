package com.wonmally.app.citizen.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record CitizenProfileResponseDTO(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String address,
    String bloodGroup,
    String emergencyContact,
    String preferredLanguage
) {}