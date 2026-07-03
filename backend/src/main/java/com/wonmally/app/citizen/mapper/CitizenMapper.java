package com.wonmally.app.citizen.mapper;

import com.wonmally.app.citizen.dto.CitizenProfileResponseDTO;
import com.wonmally.app.citizen.entity.Citizen;
import org.springframework.stereotype.Component;

@Component
public class CitizenMapper {

    public CitizenProfileResponseDTO toResponse(Citizen citizen) {
        return CitizenProfileResponseDTO.builder()
            .id(citizen.getId())
            .firstName(citizen.getUser().getFirstName())
            .lastName(citizen.getUser().getLastName())
            .email(citizen.getUser().getEmail())
            .phone(citizen.getUser().getPhone())
            .address(citizen.getAddress())
            .bloodGroup(citizen.getBloodGroup())
            .emergencyContact(citizen.getEmergencyContact())
            .preferredLanguage(citizen.getPreferredLanguage())
            .build();
    }
}