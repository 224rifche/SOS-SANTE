package com.wonmally.app.alert.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateEmergencyCategoryRequestDTO(

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caracteres")
    String name,

    @NotNull(message = "La priorite est obligatoire")
    @Min(value = 1, message = "La priorite doit etre au moins 1")
    Integer priority,

    String description
) {}