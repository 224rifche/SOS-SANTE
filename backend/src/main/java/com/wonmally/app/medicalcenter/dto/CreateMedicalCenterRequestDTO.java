package com.wonmally.app.medicalcenter.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateMedicalCenterRequestDTO(
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 255)
    String name,

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    String email,

    @NotBlank(message = "Le telephone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Telephone invalide")
    String phone,

    @NotBlank(message = "L'adresse est obligatoire")
    String address,

    @NotNull(message = "La latitude est obligatoire")
    BigDecimal latitude,

    @NotNull(message = "La longitude est obligatoire")
    BigDecimal longitude,

    @Min(value = 0, message = "La capacite ne peut pas etre negative")
    Integer emergencyCapacity
) {}