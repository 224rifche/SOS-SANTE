package com.wonmally.app.medicalcenter.dto;

import lombok.Builder;
import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record MedicalCenterResponseDTO(
    UUID id,
    String name,
    String email,
    String phone,
    String address,
    BigDecimal latitude,
    BigDecimal longitude,
    Integer emergencyCapacity,
    Boolean active
) {}