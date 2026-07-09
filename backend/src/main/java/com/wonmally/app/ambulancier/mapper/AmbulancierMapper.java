package com.wonmally.app.ambulancier.mapper;

import com.wonmally.app.ambulancier.dto.AmbulancierResponseDTO;
import com.wonmally.app.ambulancier.entity.Ambulancier;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class AmbulancierMapper {

    public AmbulancierResponseDTO toResponse(Ambulancier ambulancier) {
        return AmbulancierResponseDTO.builder()
            .id(ambulancier.getId())
            .userId(safeUserId(ambulancier))
            .userFirstName(safeUserFirstName(ambulancier))
            .userLastName(safeUserLastName(ambulancier))
            .userEmail(safeUserEmail(ambulancier))
            .medicalCenterId(ambulancier.getMedicalCenter().getId())
            .medicalCenterName(ambulancier.getMedicalCenter().getName())
            .matricule(ambulancier.getMatricule())
            .available(ambulancier.getAvailable())
            .currentStatus(ambulancier.getCurrentStatus())
            .currentAmbulanceId(ambulancier.getCurrentAmbulance() != null ? ambulancier.getCurrentAmbulance().getId() : null)
            .currentAmbulanceRegistrationNumber(ambulancier.getCurrentAmbulance() != null ? ambulancier.getCurrentAmbulance().getRegistrationNumber() : null)
            .build();
    }

    private java.util.UUID safeUserId(Ambulancier a) {
        try { return a.getUser().getId(); } catch (EntityNotFoundException ex) { return null; }
    }

    private String safeUserFirstName(Ambulancier a) {
        try { return a.getUser().getFirstName(); } catch (EntityNotFoundException ex) { return "(compte supprime)"; }
    }

    private String safeUserLastName(Ambulancier a) {
        try { return a.getUser().getLastName(); } catch (EntityNotFoundException ex) { return ""; }
    }

    private String safeUserEmail(Ambulancier a) {
        try { return a.getUser().getEmail(); } catch (EntityNotFoundException ex) { return null; }
    }
}