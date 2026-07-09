package com.wonmally.app.ambulancier.service;

import com.wonmally.app.ambulance.entity.Ambulance;
import com.wonmally.app.ambulance.repository.AmbulanceRepository;
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

import java.security.SecureRandom;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AmbulancierService {

    private final AmbulancierRepository ambulancierRepository;
    private final MedicalCenterRepository medicalCenterRepository;
    private final UserRepository userRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final AmbulancierMapper mapper;

    private static final Set<String> VALID_STATUSES = Set.of(
        "OFF_DUTY", "ON_DUTY", "EN_ROUTE", "ON_MISSION", "BREAK"
    );

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional(readOnly = true)
    public Page<AmbulancierResponseDTO> listAmbulanciers(Pageable pageable) {
        return ambulancierRepository.findAll(Objects.requireNonNull(pageable)).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AmbulancierResponseDTO getAmbulancierById(UUID id) {
        Ambulancier ambulancier = ambulancierRepository.findById(Objects.requireNonNull(id))
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

        User user = userRepository.findById(Objects.requireNonNull(dto.userId()))
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        MedicalCenter medicalCenter = medicalCenterRepository.findById(Objects.requireNonNull(dto.medicalCenterId()))
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        String matricule = (dto.matricule() != null && !dto.matricule().isBlank())
            ? dto.matricule()
            : generateUniqueMatricule();

        if (ambulancierRepository.existsByMatriculeIgnoreCase(matricule)) {
            throw new ResourceConflictException("Ce matricule est deja utilise");
        }

        Ambulancier ambulancier = Ambulancier.builder()
            .user(user)
            .medicalCenter(medicalCenter)
            .matricule(matricule)
            .available(true)
            .currentStatus("OFF_DUTY")
            .build();

        return mapper.toResponse(Objects.requireNonNull(ambulancierRepository.save(ambulancier)));
    }

    /**
     * Genere un matricule unique au format AMB-XXXXXX (6 chiffres), en reessayant
     * en cas de collision improbable avec un matricule deja existant.
     */
    private String generateUniqueMatricule() {
        String candidate;
        int attempts = 0;
        do {
            int number = 100000 + RANDOM.nextInt(900000);
            candidate = "AMB-" + number;
            attempts++;
        } while (ambulancierRepository.existsByMatriculeIgnoreCase(candidate) && attempts < 20);
        return candidate;
    }

    @Transactional
    public AmbulancierResponseDTO updateStatus(UUID id, UpdateAmbulancierStatusRequestDTO dto) {
        Ambulancier ambulancier = ambulancierRepository.findById(Objects.requireNonNull(id))
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
        Ambulancier ambulancier = ambulancierRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Ambulancier introuvable"));

        ambulancier.setAvailable(dto.available());
        return mapper.toResponse(ambulancierRepository.save(ambulancier));
    }

    @Transactional
    public AmbulancierResponseDTO assignVehicle(UUID id, UUID ambulanceId) {
        Ambulancier ambulancier = ambulancierRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Ambulancier introuvable"));

        if (ambulanceId == null) {
            ambulancier.setCurrentAmbulance(null);
        } else {
            Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable"));
            ambulancier.setCurrentAmbulance(ambulance);
        }

        return mapper.toResponse(ambulancierRepository.save(ambulancier));
    }
}