package com.wonmally.app.ambulance.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateAmbulanceStatusRequestDTO(
    @NotBlank(message = "Le statut est obligatoire")
    String status
) {}