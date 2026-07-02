package com.wonmally.app.geolocation.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CoordinatesDTO(
    @NotNull(message = "La latitude est obligatoire")
    BigDecimal latitude,

    @NotNull(message = "La longitude est obligatoire")
    BigDecimal longitude
) {}