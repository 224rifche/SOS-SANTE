package com.wonmally.app.alert.dto;

import com.wonmally.app.common.InterventionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertResponse {
    private UUID id;
    private String categoryName;
    private Integer priority;
    private InterventionStatus status;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime createdAt;
}
