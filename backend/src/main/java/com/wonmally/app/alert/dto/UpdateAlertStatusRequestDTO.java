package com.wonmally.app.alert.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateAlertStatusRequestDTO(
    @NotBlank(message = "Le statut est obligatoire")
    String status
) {}