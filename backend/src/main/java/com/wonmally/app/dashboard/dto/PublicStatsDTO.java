package com.wonmally.app.dashboard.dto;

import lombok.Builder;

@Builder
public record PublicStatsDTO(
    long totalAlertsHandled,
    long availableAmbulances,
    long activeInterventions
) {}