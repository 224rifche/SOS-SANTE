package com.wonmally.app.ambulancier.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateAmbulancierAvailabilityRequestDTO(
    @NotNull(message = "La disponibilite est obligatoire")
    Boolean available
) {}