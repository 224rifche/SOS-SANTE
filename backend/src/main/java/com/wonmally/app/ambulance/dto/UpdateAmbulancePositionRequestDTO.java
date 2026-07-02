package com.wonmally.app.ambulance.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateAmbulancePositionRequestDTO(
    @NotNull(message = "La latitude est obligatoire")
    BigDecimal gpsLatitude,

    @NotNull(message = "La longitude est obligatoire")
    BigDecimal gpsLongitude
) {}