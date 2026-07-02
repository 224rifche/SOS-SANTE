package com.wonmally.app.ambulancier.service;

import com.wonmally.app.ambulancier.dto.*;
import com.wonmally.app.ambulancier.entity.Ambulancier;
import com.wonmally.app.ambulancier.mapper.AmbulancierMapper;
import com.wonmally.app.ambulancier.repository.AmbulancierRepository;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceConflictException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.medicalcenter.repository.MedicalCenterRepository;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AmbulancierService {

    private final AmbulancierRepository ambulancierRepository;
    private final MedicalCenterRepository medicalCenterRepository;
    private final UserRepository userRepository;
    private final AmbulancierMapper mapper;

    private static final Set<String> VALID_STATUSES = Set.of(
        "OFF_DUTY", "ON_DUTY", "EN_ROUTE", "ON_MISSION", "BREAK"
    );

    @Transactional(readOnly = true)
    public Page<AmbulancierResponseDTO> listAmbulanciers(Pageable pageable) {
        return ambulancierRepository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AmbulancierResponseDTO getAmbulancierById(UUID id) {
        Ambulancier ambulancier = ambulancierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulancier introuvable"));
        return mapper.toResponse(ambulancier);
    }

    @Transactional(readOnly = true)
    public AmbulancierResponseDTO getMyProfile(UUID userId) {
        Ambulancier ambulancier = ambulancierRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profil ambulancier introuvable"));
        return mapper.toResponse(ambulancier);
    }

    @Transactional
    public AmbulancierResponseDTO createAmbulancier(CreateAmbulancierRequestDTO dto) {
        if (ambulancierRepository.existsByUserId(dto.userId())) {
            throw new ResourceConflictException("Cet utilisateur a deja un profil ambulancier");
        }

        if (ambulancierRepository.existsByMatriculeIgnoreCase(dto.matricule())) {
            throw new ResourceConflictException("Ce matricule est deja utilise");
        }

        User user = userRepository.findById(dto.userId())
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        MedicalCenter medicalCenter = medicalCenterRepository.findById(dto.medicalCenterId())
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        Ambulancier ambulancier = Ambulancier.builder()
            .user(user)
            .medicalCenter(medicalCenter)
            .matricule(dto.matricule())
            .available(true)
            .currentStatus("OFF_DUTY")
            .build();

        return mapper.toResponse(ambulancierRepository.save(ambulancier));
    }

    @Transactional
    public AmbulancierResponseDTO updateStatus(UUID id, UpdateAmbulancierStatusRequestDTO dto) {
        Ambulancier ambulancier = ambulancierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulancier introuvable"));

        String newStatus = dto.currentStatus().toUpperCase();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Statut invalide. Valeurs autorisees : " + VALID_STATUSES);
        }

        ambulancier.setCurrentStatus(newStatus);
        return mapper.toResponse(ambulancierRepository.save(ambulancier));
    }

    @Transactional
    public AmbulancierResponseDTO updateAvailability(UUID id, UpdateAmbulancierAvailabilityRequestDTO dto) {
        Ambulancier ambulancier = ambulancierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulancier introuvable"));

        ambulancier.setAvailable(dto.available());
        return mapper.toResponse(ambulancierRepository.save(ambulancier));
    }
}