package com.wonmally.app.intervention.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateMedicalNoteRequestDTO(
    @NotNull(message = "L'intervention est obligatoire")
    UUID interventionId,

    @NotBlank(message = "Le diagnostic est obligatoire")
    String diagnosis,

    String observations
) {}