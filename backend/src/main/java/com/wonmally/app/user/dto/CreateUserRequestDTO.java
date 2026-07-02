package com.wonmally.app.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateUserRequestDTO(

    @NotBlank @Email(message = "Email invalide")
    String email,

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Mot de passe trop faible"
    )
    String password,

    @NotBlank @Size(min = 2, max = 100)
    String firstName,

    @NotBlank @Size(min = 2, max = 100)
    String lastName,

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Telephone invalide")
    String phone,

    @NotEmpty(message = "Au moins un role est requis")
    Set<String> roleNames
) {}