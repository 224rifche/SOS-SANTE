package com.wonmally.app.ambulancier.mapper;

import com.wonmally.app.ambulancier.dto.AmbulancierResponseDTO;
import com.wonmally.app.ambulancier.entity.Ambulancier;
import org.springframework.stereotype.Component;

@Component
public class AmbulancierMapper {

    public AmbulancierResponseDTO toResponse(Ambulancier ambulancier) {
        return AmbulancierResponseDTO.builder()
            .id(ambulancier.getId())
            .userId(ambulancier.getUser().getId())
            .userFirstName(ambulancier.getUser().getFirstName())
            .userLastName(ambulancier.getUser().getLastName())
            .userEmail(ambulancier.getUser().getEmail())
            .medicalCenterId(ambulancier.getMedicalCenter().getId())
            .medicalCenterName(ambulancier.getMedicalCenter().getName())
            .matricule(ambulancier.getMatricule())
            .available(ambulancier.getAvailable())
            .currentStatus(ambulancier.getCurrentStatus())
            .build();
    }
}