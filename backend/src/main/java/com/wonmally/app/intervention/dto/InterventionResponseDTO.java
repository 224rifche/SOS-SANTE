package com.wonmally.app.intervention.dto;

import com.wonmally.app.common.InterventionStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record InterventionResponseDTO(
    UUID id,
    UUID alertId,
    UUID medicalCenterId,
    String medicalCenterName,
    UUID ambulanceId,
    String ambulanceRegistrationNumber,
    UUID doctorId,
    String doctorName,
    InterventionStatus currentStatus,
    LocalDateTime startedAt,
    LocalDateTime completedAt,
    Boolean archived,
    String heartRate,
    String bloodPressure,
    String spo2,
    String temperature,
    String consciousness,
    Boolean oxygenPlaced,
    Boolean ecgDone
) {}