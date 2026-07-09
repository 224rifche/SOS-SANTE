package com.wonmally.app.citizen.service;

import com.wonmally.app.citizen.dto.CitizenProfileResponseDTO;
import com.wonmally.app.citizen.dto.UpdateCitizenProfileRequestDTO;
import com.wonmally.app.citizen.entity.Citizen;
import com.wonmally.app.citizen.mapper.CitizenMapper;
import com.wonmally.app.citizen.repository.CitizenRepository;
import com.wonmally.app.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final CitizenMapper mapper;

    @Transactional(readOnly = true)
    public CitizenProfileResponseDTO getMyProfile(UUID userId) {
        Citizen citizen = citizenRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profil citoyen introuvable"));
        return mapper.toResponse(citizen);
    }

    @Transactional
    public CitizenProfileResponseDTO updateMyProfile(UUID userId, UpdateCitizenProfileRequestDTO dto) {
        Citizen citizen = citizenRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profil citoyen introuvable"));
        citizen.setAddress(dto.address());
        citizen.setBloodGroup(dto.bloodGroup());
        citizen.setEmergencyContact(dto.emergencyContact());
        citizen.setPreferredLanguage(dto.preferredLanguage());
        return mapper.toResponse(citizenRepository.save(citizen));
    }

    @Transactional(readOnly = true)
    public Page<CitizenProfileResponseDTO> listCitizens(Pageable pageable) {
        return citizenRepository.findAll(Objects.requireNonNull(pageable)).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CitizenProfileResponseDTO getCitizenById(UUID id) {
        Citizen citizen = citizenRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Citoyen introuvable"));
        return mapper.toResponse(citizen);
    }
}