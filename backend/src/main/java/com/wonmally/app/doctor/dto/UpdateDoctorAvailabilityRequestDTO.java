package com.wonmally.app.doctor.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateDoctorAvailabilityRequestDTO(
    @NotNull(message = "La disponibilite est obligatoire")
    Boolean available
) {}