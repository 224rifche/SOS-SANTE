package com.wonmally.app.doctor.mapper;

import com.wonmally.app.doctor.dto.DoctorResponseDTO;
import com.wonmally.app.doctor.entity.Doctor;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {

    public DoctorResponseDTO toResponse(Doctor doctor) {
        return DoctorResponseDTO.builder()
            .id(doctor.getId())
            .userId(safeUserId(doctor))
            .userFirstName(safeUserFirstName(doctor))
            .userLastName(safeUserLastName(doctor))
            .userEmail(safeUserEmail(doctor))
            .medicalCenterId(doctor.getMedicalCenter().getId())
            .medicalCenterName(doctor.getMedicalCenter().getName())
            .specialty(doctor.getSpecialty())
            .licenseNumber(doctor.getLicenseNumber())
            .available(doctor.getAvailable())
            .status(doctor.getStatus())
            .build();
    }

    private java.util.UUID safeUserId(Doctor doctor) {
        try { return doctor.getUser().getId(); } catch (EntityNotFoundException ex) { return null; }
    }

    private String safeUserFirstName(Doctor doctor) {
        try { return doctor.getUser().getFirstName(); } catch (EntityNotFoundException ex) { return "(compte supprime)"; }
    }

    private String safeUserLastName(Doctor doctor) {
        try { return doctor.getUser().getLastName(); } catch (EntityNotFoundException ex) { return ""; }
    }

    private String safeUserEmail(Doctor doctor) {
        try { return doctor.getUser().getEmail(); } catch (EntityNotFoundException ex) { return null; }
    }
}