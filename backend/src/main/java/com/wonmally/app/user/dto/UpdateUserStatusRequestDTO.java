package com.wonmally.app.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequestDTO(
    @NotNull(message = "Le statut enabled est obligatoire")
    Boolean enabled
) {}