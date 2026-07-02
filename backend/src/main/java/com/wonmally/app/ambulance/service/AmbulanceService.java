package com.wonmally.app.ambulance.service;

import com.wonmally.app.ambulance.dto.*;
import com.wonmally.app.ambulance.entity.Ambulance;
import com.wonmally.app.ambulance.mapper.AmbulanceMapper;
import com.wonmally.app.ambulance.repository.AmbulanceRepository;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceConflictException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.medicalcenter.repository.MedicalCenterRepository;
import com.wonmally.app.websocket.AlertWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final MedicalCenterRepository medicalCenterRepository;
    private final AmbulanceMapper mapper;
    private final AlertWebSocketService webSocketService;

    private static final Set<String> VALID_STATUSES = Set.of(
        "AVAILABLE", "EN_ROUTE", "ON_MISSION", "MAINTENANCE", "OUT_OF_SERVICE"
    );

    @Transactional(readOnly = true)
    public Page<AmbulanceResponseDTO> listAmbulances(String status, UUID medicalCenterId, Pageable pageable) {
        Specification<Ambulance> byStatus = (root, query, cb) ->
                status == null || status.isBlank() ? cb.conjunction() : cb.equal(root.get("status"), status);
        Specification<Ambulance> byMedicalCenter = (root, query, cb) ->
                medicalCenterId == null ? cb.conjunction() : cb.equal(root.get("medicalCenter").get("id"), medicalCenterId);

        Specification<Ambulance> spec = Specification.where(byStatus).and(byMedicalCenter);

        return ambulanceRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AmbulanceResponseDTO getAmbulanceById(UUID id) {
        Ambulance ambulance = ambulanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable"));
        return mapper.toResponse(ambulance);
    }

    @Transactional
    public AmbulanceResponseDTO createAmbulance(CreateAmbulanceRequestDTO dto) {
        if (ambulanceRepository.existsByRegistrationNumberIgnoreCase(dto.registrationNumber())) {
            throw new ResourceConflictException("Ce numero d'immatriculation est deja utilise");
        }

        MedicalCenter medicalCenter = medicalCenterRepository.findById(dto.medicalCenterId())
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        Ambulance ambulance = Ambulance.builder()
            .registrationNumber(dto.registrationNumber())
            .model(dto.model())
            .medicalCenter(medicalCenter)
            .status("AVAILABLE")
            .build();

        return mapper.toResponse(ambulanceRepository.save(ambulance));
    }

    @Transactional
    public AmbulanceResponseDTO updateAmbulance(UUID id, UpdateAmbulanceRequestDTO dto) {
        Ambulance ambulance = ambulanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable"));

        mapper.updateEntityFromDto(ambulance, dto);
        return mapper.toResponse(ambulanceRepository.save(ambulance));
    }

    @Transactional
    public AmbulanceResponseDTO updateStatus(UUID id, UpdateAmbulanceStatusRequestDTO dto) {
        Ambulance ambulance = ambulanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable"));

        String newStatus = dto.status().toUpperCase();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Statut invalide. Valeurs autorisees : " + VALID_STATUSES);
        }

        ambulance.setStatus(newStatus);
        return mapper.toResponse(ambulanceRepository.save(ambulance));
    }

    @Transactional
    public AmbulanceResponseDTO updatePosition(UUID id, UpdateAmbulancePositionRequestDTO dto) {
        Ambulance ambulance = ambulanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable"));

        ambulance.setGpsLatitude(dto.gpsLatitude());
        ambulance.setGpsLongitude(dto.gpsLongitude());
        Ambulance saved = ambulanceRepository.save(ambulance);

        AmbulanceResponseDTO response = mapper.toResponse(saved);
        webSocketService.broadcastAmbulancePosition(response);

        return response;
    }

    @Transactional
    public void deleteAmbulance(UUID id) {
        Ambulance ambulance = ambulanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable"));
        ambulanceRepository.delete(ambulance);
    }
}