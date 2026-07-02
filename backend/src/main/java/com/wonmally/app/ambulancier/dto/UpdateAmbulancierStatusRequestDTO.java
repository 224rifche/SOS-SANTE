package com.wonmally.app.ambulancier.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateAmbulancierStatusRequestDTO(
    @NotBlank(message = "Le statut est obligatoire")
    String currentStatus
) {}