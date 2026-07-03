package com.wonmally.app.doctor.mapper;

import com.wonmally.app.doctor.dto.DoctorResponseDTO;
import com.wonmally.app.doctor.entity.Doctor;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {

    public DoctorResponseDTO toResponse(Doctor doctor) {
        return DoctorResponseDTO.builder()
            .id(doctor.getId())
            .userId(doctor.getUser().getId())
            .userFirstName(doctor.getUser().getFirstName())
            .userLastName(doctor.getUser().getLastName())
            .userEmail(doctor.getUser().getEmail())
            .medicalCenterId(doctor.getMedicalCenter().getId())
            .medicalCenterName(doctor.getMedicalCenter().getName())
            .specialty(doctor.getSpecialty())
            .licenseNumber(doctor.getLicenseNumber())
            .available(doctor.getAvailable())
            .status(doctor.getStatus())
            .build();
    }
}