package com.wonmally.app.geolocation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NamedCoordinatesDTO(
    @NotBlank(message = "L'identifiant est obligatoire")
    String id,

    @NotNull(message = "Les coordonnees sont obligatoires")
    @Valid
    CoordinatesDTO coordinates
) {}