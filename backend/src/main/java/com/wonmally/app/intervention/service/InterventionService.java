package com.wonmally.app.intervention.service;

import com.wonmally.app.ambulance.entity.Ambulance;
import com.wonmally.app.ambulance.repository.AmbulanceRepository;
import com.wonmally.app.ambulancier.entity.Ambulancier;
import com.wonmally.app.ambulancier.repository.AmbulancierRepository;
import com.wonmally.app.audit.service.AuditService;
import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.doctor.entity.Doctor;
import com.wonmally.app.doctor.repository.DoctorRepository;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.intervention.dto.InterventionResponseDTO;
import com.wonmally.app.intervention.dto.InterventionStatusUpdateRequest;
import com.wonmally.app.intervention.entity.Intervention;
import com.wonmally.app.intervention.mapper.InterventionMapper;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.websocket.AlertWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Service metier du module Intervention - implemente la machine a etats
 * officielle du workflow (Phase 5 / Phase 6 - Partie 1).
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final DoctorRepository doctorRepository;
    private final AlertWebSocketService webSocketService;
    private final AmbulancierRepository ambulancierRepository;
    private final InterventionMapper interventionMapper;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final Map<InterventionStatus, Set<InterventionStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(InterventionStatus.class);
    static {
        ALLOWED_TRANSITIONS.put(InterventionStatus.ALERTE_CREEE, EnumSet.of(InterventionStatus.EN_ATTENTE_VALIDATION));
        ALLOWED_TRANSITIONS.put(InterventionStatus.EN_ATTENTE_VALIDATION, EnumSet.of(InterventionStatus.VALIDEE, InterventionStatus.REJETEE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.VALIDEE, EnumSet.of(InterventionStatus.AMBULANCE_AFFECTEE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.AMBULANCE_AFFECTEE, EnumSet.of(InterventionStatus.AMBULANCE_EN_ROUTE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.AMBULANCE_EN_ROUTE, EnumSet.of(InterventionStatus.ARRIVEE_SUR_LES_LIEUX));
        ALLOWED_TRANSITIONS.put(InterventionStatus.ARRIVEE_SUR_LES_LIEUX, EnumSet.of(InterventionStatus.PATIENT_PRIS_EN_CHARGE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.PATIENT_PRIS_EN_CHARGE, EnumSet.of(InterventionStatus.TRANSPORT_VERS_CENTRE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.TRANSPORT_VERS_CENTRE, EnumSet.of(InterventionStatus.ARRIVEE_AUX_URGENCES));
        ALLOWED_TRANSITIONS.put(InterventionStatus.ARRIVEE_AUX_URGENCES, EnumSet.of(InterventionStatus.MEDECIN_ASSIGNE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.MEDECIN_ASSIGNE, EnumSet.of(InterventionStatus.PRISE_EN_CHARGE_MEDICALE_EN_COURS));
        ALLOWED_TRANSITIONS.put(InterventionStatus.PRISE_EN_CHARGE_MEDICALE_EN_COURS, EnumSet.of(InterventionStatus.PRISE_EN_CHARGE_MEDICALE_TERMINEE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.PRISE_EN_CHARGE_MEDICALE_TERMINEE, EnumSet.of(InterventionStatus.INTERVENTION_CLOTUREE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.INTERVENTION_CLOTUREE, EnumSet.of(InterventionStatus.ARCHIVEE));
        ALLOWED_TRANSITIONS.put(InterventionStatus.REJETEE, EnumSet.noneOf(InterventionStatus.class));
        ALLOWED_TRANSITIONS.put(InterventionStatus.ARCHIVEE, EnumSet.noneOf(InterventionStatus.class));
    }

    @Transactional
    public InterventionResponseDTO updateStatus(UUID interventionId, InterventionStatusUpdateRequest request) {
        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable."));

        validateTransition(intervention.getCurrentStatus(), request.getNewStatus());

        if (request.getNewStatus() == InterventionStatus.AMBULANCE_AFFECTEE) {
            if (request.getAmbulanceId() == null) {
                throw new BadRequestException("L'identifiant de l'ambulance est requis pour cette transition.");
            }
            Ambulance ambulance = ambulanceRepository.findById(request.getAmbulanceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ambulance introuvable."));
            intervention.setAmbulance(ambulance);
        }

        if (request.getNewStatus() == InterventionStatus.MEDECIN_ASSIGNE) {
            if (request.getDoctorId() == null) {
                throw new BadRequestException("L'identifiant du medecin est requis pour cette transition.");
            }
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medecin introuvable."));
            intervention.setDoctor(doctor);
        }

        if (request.getNewStatus() == InterventionStatus.VALIDEE) {
            intervention.setStartedAt(LocalDateTime.now());
        }

        if (request.getNewStatus() == InterventionStatus.INTERVENTION_CLOTUREE) {
            intervention.setCompletedAt(LocalDateTime.now());
        }

        if (request.getNewStatus() == InterventionStatus.ARCHIVEE) {
            intervention.setArchived(true);
        }

        intervention.updateStatus(request.getNewStatus());
        intervention = interventionRepository.save(intervention);

        logCurrentUserAction("INTERVENTION_STATUS_" + request.getNewStatus(), intervention.getId());

        InterventionResponseDTO response = interventionMapper.toResponse(intervention);
        webSocketService.broadcastInterventionUpdate(response);

        return response;
    }

    private void logCurrentUserAction(String action, UUID entityId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElse(null);
            auditService.logAction(action, user, "INTERVENTION", entityId);
        } catch (Exception ignored) {
            // L'audit ne doit jamais casser le flux principal
        }
    }

    @Transactional(readOnly = true)
    public InterventionResponseDTO getInterventionById(UUID id) {
        Intervention intervention = interventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable."));
        return interventionMapper.toResponse(intervention);
    }

    @Transactional(readOnly = true)
    public InterventionResponseDTO getInterventionByAlertId(UUID alertId) {
        Intervention intervention = interventionRepository.findByAlertId(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable pour cette alerte."));
        return interventionMapper.toResponse(intervention);
    }

    @Transactional(readOnly = true)
    public Page<InterventionResponseDTO> listInterventions(Pageable pageable) {
        return interventionRepository.findAll(pageable).map(interventionMapper::toResponse);
    }

    /**
     * Retourne l'intervention active (non terminee, non archivee) sur laquelle
     * l'ambulancier connecte est actuellement affecte, via son ambulance assignee
     * (Ambulancier.currentAmbulance) - lien precis, pas une approximation par centre medical.
     */
    @Transactional(readOnly = true)
    public Optional<InterventionResponseDTO> getActiveInterventionForUser(UUID userId) {
        Ambulancier ambulancier = ambulancierRepository.findByUserId(userId).orElse(null);
        if (ambulancier == null || ambulancier.getCurrentAmbulance() == null) {
            return Optional.empty();
        }

        return interventionRepository
                .findFirstByAmbulanceIdAndCompletedAtIsNullAndArchivedFalse(ambulancier.getCurrentAmbulance().getId())
                .map(interventionMapper::toResponse);
    }

    private void validateTransition(InterventionStatus current, InterventionStatus target) {
        Set<InterventionStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(target)) {
            throw new BadRequestException(
                    "Transition de statut invalide : " + current + " -> " + target);
        }
    }
}