package com.wonmally.app.intervention.dto;

public record VitalSignsRequestDTO(
    String heartRate,
    String bloodPressure,
    String spo2,
    String temperature,
    String consciousness,
    Boolean oxygenPlaced,
    Boolean ecgDone
) {}