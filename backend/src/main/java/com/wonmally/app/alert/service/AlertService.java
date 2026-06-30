package com.wonmally.app.alert.service;

import com.wonmally.app.alert.dto.AlertRequest;
import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.alert.entity.Alert;
import com.wonmally.app.alert.entity.EmergencyCategory;
import com.wonmally.app.alert.entity.Location;
import com.wonmally.app.alert.mapper.AlertMapper;
import com.wonmally.app.alert.repository.AlertRepository;
import com.wonmally.app.alert.repository.EmergencyCategoryRepository;
import com.wonmally.app.citizen.entity.Citizen;
import com.wonmally.app.citizen.repository.CitizenRepository;
import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.intervention.entity.Intervention;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.medicalcenter.repository.MedicalCenterRepository;
import com.wonmally.app.websocket.AlertWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service metier du module Alert - coeur de la plateforme Won-Mally.
 * Orchestration : creation -> persistance -> diffusion temps reel -> creation
 * automatique de l'Intervention associee.
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AlertService {

    private final AlertRepository alertRepository;
    private final EmergencyCategoryRepository categoryRepository;
    private final CitizenRepository citizenRepository;
    private final InterventionRepository interventionRepository;
    private final MedicalCenterRepository medicalCenterRepository;
    private final AlertMapper alertMapper;
    private final AlertWebSocketService webSocketService;

    @Transactional
    public AlertResponse createAlert(UUID citizenUserId, AlertRequest request) {
        Citizen citizen = citizenRepository.findByUserId(citizenUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil citoyen introuvable."));

        EmergencyCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie d'urgence introuvable."));

        Location location = Location.builder()
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .source("GPS")
                .build();

        Alert alert = Alert.builder()
                .citizen(citizen)
                .category(category)
                .location(location)
                .description(request.getDescription())
                .priority(category.getPriority())
                .status(InterventionStatus.ALERTE_CREEE)
                .build();

        alert = alertRepository.save(alert);

        // Affectation automatique au centre medical le plus proche (logique simplifiee MVP :
        // a affiner avec un calcul de distance geographique reel en V1.5).
        MedicalCenter nearestCenter = medicalCenterRepository.findByActiveTrue().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Aucun centre medical actif disponible."));

        Intervention intervention = Intervention.builder()
                .alert(alert)
                .medicalCenter(nearestCenter)
                .currentStatus(InterventionStatus.EN_ATTENTE_VALIDATION)
                .build();
        interventionRepository.save(intervention);

        alert.setStatus(InterventionStatus.EN_ATTENTE_VALIDATION);
        alertRepository.save(alert);

        webSocketService.broadcastNewAlert(alert);

        return alertMapper.toResponse(alert);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByCitizen(UUID citizenUserId) {
        Citizen citizen = citizenRepository.findByUserId(citizenUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil citoyen introuvable."));

        return alertRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId()).stream()
                .map(alertMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlertResponse getAlertById(UUID alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable."));
        return alertMapper.toResponse(alert);
    }
}
