package com.wonmally.app.geolocation.dto;

import lombok.Builder;

@Builder
public record DistanceResponseDTO(
    Double distanceKm,
    String unit
) {}