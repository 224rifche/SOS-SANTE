package com.wonmally.app.ambulance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateAmbulanceRequestDTO(
    @NotBlank(message = "Le numero d'immatriculation est obligatoire")
    @Size(max = 50)
    String registrationNumber,

    @NotBlank(message = "Le modele est obligatoire")
    @Size(max = 100)
    String model,

    @NotNull(message = "Le centre medical est obligatoire")
    UUID medicalCenterId
) {}