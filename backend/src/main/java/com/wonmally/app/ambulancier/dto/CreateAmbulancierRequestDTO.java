package com.wonmally.app.ambulancier.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateAmbulancierRequestDTO(
    @NotNull(message = "L'utilisateur est obligatoire")
    UUID userId,

    @NotNull(message = "Le centre medical est obligatoire")
    UUID medicalCenterId,

    @Size(max = 50)
    String matricule
) {}