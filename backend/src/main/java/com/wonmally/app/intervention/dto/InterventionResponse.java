package com.wonmally.app.intervention.dto;

import com.wonmally.app.common.InterventionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterventionResponse {
    private UUID id;
    
    // Alert info
    private UUID alertId;
    private String categoryName;
    private Integer priority;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private LocalDateTime alertCreatedAt;
    
    // Citizen info
    private String citizenFirstName;
    private String citizenLastName;
    private String citizenPhone;
    private String citizenBloodGroup;
    private String citizenEmergencyContact;
    
    // Medical Center info
    private UUID medicalCenterId;
    private String medicalCenterName;
    
    // Ambulance info
    private UUID ambulanceId;
    private String ambulanceRegistrationNumber;
    private String ambulanceModel;
    
    // Doctor info
    private UUID doctorId;
    private String doctorName;
    
    private InterventionStatus currentStatus;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
