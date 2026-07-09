package com.wonmally.app.intervention.mapper;

import com.wonmally.app.intervention.dto.InterventionResponseDTO;
import com.wonmally.app.intervention.entity.Intervention;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class InterventionMapper {

    public InterventionResponseDTO toResponse(Intervention intervention) {
        return InterventionResponseDTO.builder()
            .id(intervention.getId())
            .alertId(intervention.getAlert().getId())
            .medicalCenterId(intervention.getMedicalCenter().getId())
            .medicalCenterName(intervention.getMedicalCenter().getName())
            .ambulanceId(intervention.getAmbulance() != null ? intervention.getAmbulance().getId() : null)
            .ambulanceRegistrationNumber(intervention.getAmbulance() != null ? intervention.getAmbulance().getRegistrationNumber() : null)
            .doctorId(intervention.getDoctor() != null ? intervention.getDoctor().getId() : null)
            .doctorName(safeDoctorName(intervention))
            .currentStatus(intervention.getCurrentStatus())
            .startedAt(intervention.getStartedAt())
            .completedAt(intervention.getCompletedAt())
            .archived(intervention.getArchived())
            .heartRate(intervention.getHeartRate())
            .bloodPressure(intervention.getBloodPressure())
            .spo2(intervention.getSpo2())
            .temperature(intervention.getTemperature())
            .consciousness(intervention.getConsciousness())
            .oxygenPlaced(intervention.getOxygenPlaced())
            .ecgDone(intervention.getEcgDone())
            .build();
    }

    private String safeDoctorName(Intervention intervention) {
        if (intervention.getDoctor() == null) return null;
        try {
            return intervention.getDoctor().getUser().getFirstName() + " " + intervention.getDoctor().getUser().getLastName();
        } catch (EntityNotFoundException ex) {
            return "(compte supprime)";
        }
    }
}