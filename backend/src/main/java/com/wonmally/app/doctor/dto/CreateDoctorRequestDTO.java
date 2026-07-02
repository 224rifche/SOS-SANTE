package com.wonmally.app.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateDoctorRequestDTO(
    @NotNull(message = "L'utilisateur est obligatoire")
    UUID userId,

    @NotNull(message = "Le centre medical est obligatoire")
    UUID medicalCenterId,

    @NotBlank(message = "La specialite est obligatoire")
    @Size(max = 100)
    String specialty,

    @NotBlank(message = "Le numero de licence est obligatoire")
    @Size(max = 100)
    String licenseNumber
) {}