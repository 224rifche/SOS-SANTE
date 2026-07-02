package com.wonmally.app.ambulance.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record AmbulanceResponseDTO(
    UUID id,
    String registrationNumber,
    String model,
    String status,
    UUID medicalCenterId,
    String medicalCenterName,
    BigDecimal gpsLatitude,
    BigDecimal gpsLongitude
) {}