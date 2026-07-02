package com.wonmally.app.dashboard.dto;

import lombok.Builder;

import java.util.Map;

@Builder
public record DashboardStatsDTO(
    long totalAlerts,
    long alertsToday,
    Map<String, Long> alertsByStatus,
    long totalAmbulances,
    Map<String, Long> ambulancesByStatus,
    long activeInterventions,
    long totalUsers,
    Map<String, Long> usersByRole
) {}