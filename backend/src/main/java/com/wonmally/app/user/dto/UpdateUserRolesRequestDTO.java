package com.wonmally.app.user.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateUserRolesRequestDTO(
    @NotEmpty(message = "Au moins un role est requis")
    Set<String> roleNames
) {}