package com.wonmally.app.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequestDTO(

    @NotBlank @Size(min = 2, max = 100)
    String firstName,

    @NotBlank @Size(min = 2, max = 100)
    String lastName,

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Telephone invalide")
    String phone
) {}