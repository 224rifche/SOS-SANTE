package com.wonmally.app.geolocation.dto;

import lombok.Builder;

@Builder
public record NearbyResultDTO(
    String id,
    Double distanceKm
) {}