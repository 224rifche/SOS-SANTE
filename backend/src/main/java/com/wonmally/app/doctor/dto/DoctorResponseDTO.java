package com.wonmally.app.doctor.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record DoctorResponseDTO(
    UUID id,
    UUID userId,
    String userFirstName,
    String userLastName,
    String userEmail,
    UUID medicalCenterId,
    String medicalCenterName,
    String specialty,
    String licenseNumber,
    Boolean available,
    String status
) {}