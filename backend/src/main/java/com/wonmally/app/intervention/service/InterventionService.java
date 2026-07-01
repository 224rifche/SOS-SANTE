package com.wonmally.app.intervention.service;

import com.wonmally.app.ambulance.entity.Ambulance;
import com.wonmally.app.ambulance.repository.AmbulanceRepository;
import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.doctor.entity.Doctor;
import com.wonmally.app.doctor.repository.DoctorRepository;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.intervention.dto.InterventionStatusUpdateRequest;
import com.wonmally.app.intervention.entity.Intervention;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.websocket.AlertWebSocketService;
import com.wonmally.app.ambulancier.repository.AmbulancierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Optional;

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

    /** Transitions autorisees de la machine a etats officielle du MVP. */
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
    public Intervention updateStatus(UUID interventionId, InterventionStatusUpdateRequest request) {
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

        webSocketService.broadcastInterventionUpdate(intervention);

        return intervention;
    }

    private void validateTransition(InterventionStatus current, InterventionStatus target) {
        Set<InterventionStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(target)) {
            throw new BadRequestException(
                    "Transition de statut invalide : " + current + " -> " + target);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Intervention> getActiveInterventionForUser(UUID userId) {
        var ambulancierOpt = ambulancierRepository.findByUserId(userId);
        if (ambulancierOpt.isEmpty()) {
            return Optional.empty();
        }
        var ambulancier = ambulancierOpt.get();
        return interventionRepository.findAll().stream()
                .filter(i -> i.getCompletedAt() == null && !Boolean.TRUE.equals(i.getArchived())
                        && i.getMedicalCenter().getId().equals(ambulancier.getMedicalCenter().getId())
                        && i.getAmbulance() != null)
                .findFirst();
    }
}
