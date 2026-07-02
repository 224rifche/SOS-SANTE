package com.wonmally.app.ambulance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAmbulanceRequestDTO(
    @NotBlank(message = "Le modele est obligatoire")
    @Size(max = 100)
    String model
) {}