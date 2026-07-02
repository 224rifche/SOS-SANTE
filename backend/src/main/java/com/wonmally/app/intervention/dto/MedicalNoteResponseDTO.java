package com.wonmally.app.intervention.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record MedicalNoteResponseDTO(
    UUID id,
    UUID interventionId,
    UUID doctorId,
    String doctorName,
    String diagnosis,
    String observations,
    LocalDateTime createdAt
) {}