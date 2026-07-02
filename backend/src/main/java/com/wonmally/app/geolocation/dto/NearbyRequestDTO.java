package com.wonmally.app.geolocation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record NearbyRequestDTO(
    @NotNull(message = "Le point de reference est obligatoire")
    @Valid
    CoordinatesDTO reference,

    @NotEmpty(message = "La liste des points candidats est obligatoire")
    @Valid
    List<NamedCoordinatesDTO> candidates,

    Integer maxResults
) {}