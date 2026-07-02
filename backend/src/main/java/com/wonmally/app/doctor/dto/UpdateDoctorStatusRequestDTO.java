package com.wonmally.app.doctor.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDoctorStatusRequestDTO(
    @NotBlank(message = "Le statut est obligatoire")
    String status
) {}