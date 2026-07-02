package com.wonmally.app.alert.dto;

import lombok.Builder;

@Builder
public record EmergencyCategoryResponseDTO(
    Long id,
    String name,
    Integer priority,
    String description
) {}