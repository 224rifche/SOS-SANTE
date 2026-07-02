package com.wonmally.app.ambulance.mapper;

import com.wonmally.app.ambulance.dto.AmbulanceResponseDTO;
import com.wonmally.app.ambulance.dto.UpdateAmbulanceRequestDTO;
import com.wonmally.app.ambulance.entity.Ambulance;
import org.springframework.stereotype.Component;

@Component
public class AmbulanceMapper {

    public AmbulanceResponseDTO toResponse(Ambulance ambulance) {
        return AmbulanceResponseDTO.builder()
            .id(ambulance.getId())
            .registrationNumber(ambulance.getRegistrationNumber())
            .model(ambulance.getModel())
            .status(ambulance.getStatus())
            .medicalCenterId(ambulance.getMedicalCenter().getId())
            .medicalCenterName(ambulance.getMedicalCenter().getName())
            .gpsLatitude(ambulance.getGpsLatitude())
            .gpsLongitude(ambulance.getGpsLongitude())
            .build();
    }

    public void updateEntityFromDto(Ambulance ambulance, UpdateAmbulanceRequestDTO dto) {
        ambulance.setModel(dto.model());
    }
}