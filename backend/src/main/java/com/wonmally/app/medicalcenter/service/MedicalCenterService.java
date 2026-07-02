package com.wonmally.app.medicalcenter.service;

import com.wonmally.app.exception.EmailAlreadyExistsException;
import com.wonmally.app.exception.ResourceConflictException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.medicalcenter.dto.*;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.medicalcenter.mapper.MedicalCenterMapper;
import com.wonmally.app.medicalcenter.repository.MedicalCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalCenterService {

    private final MedicalCenterRepository medicalCenterRepository;
    private final InterventionRepository interventionRepository;
    private final MedicalCenterMapper mapper;

    @Transactional(readOnly = true)
    public Page<MedicalCenterResponseDTO> listCenters(Boolean active, Pageable pageable) {
        Specification<MedicalCenter> spec = (root, query, cb) ->
            active == null ? cb.conjunction() : cb.equal(root.get("active"), active);

        return medicalCenterRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public MedicalCenterResponseDTO getCenterById(UUID id) {
        MedicalCenter center = medicalCenterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));
        return mapper.toResponse(center);
    }

    @Transactional
    public MedicalCenterResponseDTO createCenter(CreateMedicalCenterRequestDTO dto) {
        if (medicalCenterRepository.existsByEmailIgnoreCase(dto.email())) {
            throw new EmailAlreadyExistsException("Cet email est deja utilise par un centre medical");
        }

        MedicalCenter center = MedicalCenter.builder()
            .name(dto.name())
            .email(dto.email())
            .phone(dto.phone())
            .address(dto.address())
            .latitude(dto.latitude())
            .longitude(dto.longitude())
            .emergencyCapacity(dto.emergencyCapacity())
            .active(true)
            .build();

        return mapper.toResponse(medicalCenterRepository.save(center));
    }

    @Transactional
    public MedicalCenterResponseDTO updateCenter(UUID id, UpdateMedicalCenterRequestDTO dto) {
        MedicalCenter center = medicalCenterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        mapper.updateEntityFromDto(center, dto);
        return mapper.toResponse(medicalCenterRepository.save(center));
    }

    @Transactional
    public MedicalCenterResponseDTO updateStatus(UUID id, UpdateMedicalCenterStatusRequestDTO dto) {
        MedicalCenter center = medicalCenterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        center.setActive(dto.active());
        return mapper.toResponse(medicalCenterRepository.save(center));
    }

    @Transactional
    public void deleteCenter(UUID id) {
        MedicalCenter center = medicalCenterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        boolean hasInterventions = !interventionRepository
            .findByMedicalCenterIdAndCurrentStatusNot(id, com.wonmally.app.common.InterventionStatus.ARCHIVEE)
            .isEmpty();

        if (hasInterventions) {
            throw new ResourceConflictException(
                "Impossible de supprimer ce centre : des interventions actives y sont liees");
        }

        medicalCenterRepository.delete(center);
    }
}