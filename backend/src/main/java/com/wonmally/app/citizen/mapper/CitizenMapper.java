package com.wonmally.app.citizen.mapper;

import com.wonmally.app.citizen.dto.CitizenProfileResponseDTO;
import com.wonmally.app.citizen.entity.Citizen;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class CitizenMapper {

    public CitizenProfileResponseDTO toResponse(Citizen citizen) {
        return CitizenProfileResponseDTO.builder()
            .id(citizen.getId())
            .firstName(safeFirstName(citizen))
            .lastName(safeLastName(citizen))
            .email(safeEmail(citizen))
            .phone(safePhone(citizen))
            .address(citizen.getAddress())
            .bloodGroup(citizen.getBloodGroup())
            .emergencyContact(citizen.getEmergencyContact())
            .preferredLanguage(citizen.getPreferredLanguage())
            .build();
    }

    private String safeFirstName(Citizen citizen) {
        try { return citizen.getUser().getFirstName(); } catch (EntityNotFoundException ex) { return "(compte supprime)"; }
    }

    private String safeLastName(Citizen citizen) {
        try { return citizen.getUser().getLastName(); } catch (EntityNotFoundException ex) { return ""; }
    }

    private String safeEmail(Citizen citizen) {
        try { return citizen.getUser().getEmail(); } catch (EntityNotFoundException ex) { return null; }
    }

    private String safePhone(Citizen citizen) {
        try { return citizen.getUser().getPhone(); } catch (EntityNotFoundException ex) { return null; }
    }
}