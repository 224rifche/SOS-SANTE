package com.wonmally.app.geolocation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record DistanceRequestDTO(
    @NotNull(message = "Le point d'origine est obligatoire")
    @Valid
    CoordinatesDTO origin,

    @NotNull(message = "Le point de destination est obligatoire")
    @Valid
    CoordinatesDTO destination
) {}