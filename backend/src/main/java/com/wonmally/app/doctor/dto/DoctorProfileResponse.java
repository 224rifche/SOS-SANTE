package com.wonmally.app.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfileResponse {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String specialty;
    private String licenseNumber;
    private Boolean available;
    private String status;
    private UUID medicalCenterId;
    private String medicalCenterName;
    private Integer emergencyCapacity;
}
