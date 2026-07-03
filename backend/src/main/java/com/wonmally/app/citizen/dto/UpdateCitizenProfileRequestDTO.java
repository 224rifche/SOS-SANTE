package com.wonmally.app.citizen.dto;

import jakarta.validation.constraints.Pattern;

public record UpdateCitizenProfileRequestDTO(
    String address,

    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Groupe sanguin invalide (ex: O+, AB-)")
    String bloodGroup,

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Numero de contact invalide")
    String emergencyContact,

    String preferredLanguage
) {}