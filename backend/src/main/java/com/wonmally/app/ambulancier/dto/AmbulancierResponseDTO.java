package com.wonmally.app.ambulancier.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record AmbulancierResponseDTO(
    UUID id,
    UUID userId,
    String userFirstName,
    String userLastName,
    String userEmail,
    UUID medicalCenterId,
    String medicalCenterName,
    String matricule,
    Boolean available,
    String currentStatus
) {}