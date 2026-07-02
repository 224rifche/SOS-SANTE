package com.wonmally.app.medicalcenter.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateMedicalCenterStatusRequestDTO(
    @NotNull(message = "Le statut actif est obligatoire")
    Boolean active
) {}