package com.wonmally.app.alert.service;

import com.wonmally.app.alert.dto.AlertRequest;
import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.alert.dto.UpdateAlertStatusRequestDTO;
import com.wonmally.app.alert.entity.Alert;
import com.wonmally.app.alert.entity.EmergencyCategory;
import com.wonmally.app.alert.entity.Location;
import com.wonmally.app.alert.mapper.AlertMapper;
import com.wonmally.app.alert.repository.AlertRepository;
import com.wonmally.app.alert.repository.EmergencyCategoryRepository;
import com.wonmally.app.audit.service.AuditService;
import com.wonmally.app.citizen.entity.Citizen;
import com.wonmally.app.citizen.repository.CitizenRepository;
import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.geolocation.dto.CoordinatesDTO;
import com.wonmally.app.geolocation.dto.NamedCoordinatesDTO;
import com.wonmally.app.geolocation.dto.NearbyRequestDTO;
import com.wonmally.app.geolocation.dto.NearbyResultDTO;
import com.wonmally.app.geolocation.service.GeolocationService;
import com.wonmally.app.intervention.entity.Intervention;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.medicalcenter.repository.MedicalCenterRepository;
import com.wonmally.app.notification.service.NotificationService;
import com.wonmally.app.security.CustomUserPrincipal;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.websocket.AlertWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

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
    private final GeolocationService geolocationService;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    private static final Set<InterventionStatus> VALID_TARGET_STATUSES = Set.of(
        InterventionStatus.VALIDEE,
        InterventionStatus.REJETEE
    );

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

        MedicalCenter nearestCenter = findNearestActiveCenter(request.getLatitude(), request.getLongitude());

        Intervention intervention = Intervention.builder()
                .alert(alert)
                .medicalCenter(nearestCenter)
                .currentStatus(InterventionStatus.EN_ATTENTE_VALIDATION)
                .build();
        interventionRepository.save(intervention);

        alert.setStatus(InterventionStatus.EN_ATTENTE_VALIDATION);
        alertRepository.save(alert);

        AlertResponse response = alertMapper.toResponse(alert);
        webSocketService.broadcastNewAlert(response);

        notificationService.notifyUser(
            citizenUserId,
            "Alerte enregistree",
            "Votre alerte a ete transmise a " + nearestCenter.getName() + " et est en attente de validation.",
            "ALERT_CREATED"
        );

        return response;
    }

    private MedicalCenter findNearestActiveCenter(java.math.BigDecimal lat, java.math.BigDecimal lon) {
        List<MedicalCenter> activeCenters = medicalCenterRepository.findByActiveTrue();

        if (activeCenters.isEmpty()) {
            throw new ResourceNotFoundException("Aucun centre medical actif disponible.");
        }

        List<MedicalCenter> centersWithCoordinates = activeCenters.stream()
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .toList();

        if (centersWithCoordinates.isEmpty()) {
            return activeCenters.get(0);
        }

        Map<String, MedicalCenter> centersById = centersWithCoordinates.stream()
                .collect(java.util.stream.Collectors.toMap(c -> c.getId().toString(), c -> c));

        List<NamedCoordinatesDTO> candidates = centersWithCoordinates.stream()
                .map(c -> new NamedCoordinatesDTO(
                        c.getId().toString(),
                        new CoordinatesDTO(c.getLatitude(), c.getLongitude())
                ))
                .toList();

        NearbyRequestDTO nearbyRequest = new NearbyRequestDTO(
                new CoordinatesDTO(lat, lon),
                candidates,
                1
        );

        List<NearbyResultDTO> results = geolocationService.findNearby(nearbyRequest);

        if (results.isEmpty()) {
            return centersWithCoordinates.get(0);
        }

        return centersById.get(results.get(0).id());
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
    public AlertResponse getAlertByIdSecured(UUID alertId, CustomUserPrincipal principal) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable."));

        boolean isPrivileged = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_MEDICAL_CENTER")
                        || role.equals("ROLE_AMBULANCIER"));

        boolean isOwner = alert.getCitizen().getUser().getId().equals(principal.getUserId());

        if (!isPrivileged && !isOwner) {
            throw new ResourceNotFoundException("Alerte introuvable.");
        }

        return alertMapper.toResponse(alert);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> listAlerts(String statusFilter) {
        List<Alert> alerts;

        if (statusFilter != null && !statusFilter.isBlank()) {
            InterventionStatus status = parseStatus(statusFilter);
            alerts = alertRepository.findByStatusOrderByCreatedAtAsc(status);
        } else {
            alerts = alertRepository.findAll();
        }

        return alerts.stream().map(alertMapper::toResponse).toList();
    }

    @Transactional
    public AlertResponse updateStatus(UUID alertId, UpdateAlertStatusRequestDTO dto) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable."));

        InterventionStatus targetStatus = parseStatus(dto.status());

        if (!VALID_TARGET_STATUSES.contains(targetStatus)) {
            throw new BadRequestException(
                "Transition invalide. Statuts autorises depuis cet endpoint : " + VALID_TARGET_STATUSES);
        }

        if (alert.getStatus() != InterventionStatus.EN_ATTENTE_VALIDATION) {
            throw new BadRequestException(
                "Cette alerte n'est plus en attente de validation (statut actuel : " + alert.getStatus() + ")");
        }

        alert.setStatus(targetStatus);
        Alert saved = alertRepository.save(alert);

        interventionRepository.findByAlertId(saved.getId()).ifPresent(intervention -> {
            intervention.updateStatus(targetStatus);
            interventionRepository.save(intervention);
        });

        logCurrentUserAction(
            targetStatus == InterventionStatus.VALIDEE ? "ALERT_VALIDATED" : "ALERT_REJECTED",
            saved.getId()
        );

        AlertResponse response = alertMapper.toResponse(saved);
        webSocketService.broadcastNewAlert(response);

        // Notification best-effort : si le compte du citoyen a ete supprime
        // entre-temps (donnee orpheline), la validation/rejet de l'alerte
        // doit quand meme reussir - seule la notification est sautee.
        try {
            UUID citizenUserId = alert.getCitizen().getUser().getId();
            if (targetStatus == InterventionStatus.VALIDEE) {
                notificationService.notifyUser(citizenUserId,
                    "Alerte validee",
                    "Votre alerte a ete validee. Une ambulance va etre affectee.",
                    "ALERT_VALIDATED");
            } else {
                notificationService.notifyUser(citizenUserId,
                    "Alerte rejetee",
                    "Votre alerte a ete rejetee par le centre medical.",
                    "ALERT_REJECTED");
            }
        } catch (jakarta.persistence.EntityNotFoundException ex) {
            // Compte citoyen orphelin : on ignore silencieusement la notification.
        }

        return response;
    }

    private void logCurrentUserAction(String action, UUID entityId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElse(null);
            auditService.logAction(action, user, "ALERT", entityId);
        } catch (Exception ignored) {
            // L'audit ne doit jamais casser le flux principal
        }
    }

    private InterventionStatus parseStatus(String rawStatus) {
        try {
            return InterventionStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Statut invalide : " + rawStatus);
        }
    }
}