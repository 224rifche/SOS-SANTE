package com.wonmally.app.dashboard.service;

import com.wonmally.app.alert.repository.AlertRepository;
import com.wonmally.app.ambulance.repository.AmbulanceRepository;
import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.dashboard.dto.DashboardStatsDTO;
import com.wonmally.app.dashboard.dto.PublicStatsDTO;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.user.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AlertRepository alertRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final InterventionRepository interventionRepository;
    private final UserRepository userRepository;

    private static final String[] ALERT_STATUSES = {
        "EN_ATTENTE_VALIDATION", "VALIDEE", "REJETEE", "INTERVENTION_CLOTUREE", "ARCHIVEE"
    };

    private static final String[] AMBULANCE_STATUSES = {
        "AVAILABLE", "EN_ROUTE", "ON_MISSION", "MAINTENANCE", "OUT_OF_SERVICE"
    };

    private static final String[] USER_ROLES = {
        "ADMIN", "CITIZEN", "MEDICAL_CENTER", "DOCTOR", "AMBULANCIER"
    };

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        Map<String, Long> alertsByStatus = new LinkedHashMap<>();
        for (String status : ALERT_STATUSES) {
            alertsByStatus.put(status, alertRepository.countByStatus(InterventionStatus.valueOf(status)));
        }

        Map<String, Long> ambulancesByStatus = new LinkedHashMap<>();
        for (String status : AMBULANCE_STATUSES) {
            ambulancesByStatus.put(status, ambulanceRepository.countByStatus(status));
        }

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (String roleName : USER_ROLES) {
            Specification<User> spec = Specification.where(UserSpecification.notDeleted())
                .and(UserSpecification.hasRole(roleName));
            usersByRole.put(roleName, userRepository.count(spec));
        }

        return DashboardStatsDTO.builder()
            .totalAlerts(alertRepository.count())
            .alertsToday(alertRepository.countByCreatedAtAfter(startOfDay))
            .alertsByStatus(alertsByStatus)
            .totalAmbulances(ambulanceRepository.count())
            .ambulancesByStatus(ambulancesByStatus)
            .activeInterventions(interventionRepository.countByArchivedFalse())
            .totalUsers(userRepository.count())
            .usersByRole(usersByRole)
            .build();
    }

    /**
     * Statistiques publiques, sans authentification, pour la landing page.
     * Volontairement limitees a des comptages agreges, sans donnee sensible
     * (aucun detail patient, aucune repartition par role utilisateur).
     */
    @Transactional(readOnly = true)
    public PublicStatsDTO getPublicStats() {
        return PublicStatsDTO.builder()
            .totalAlertsHandled(alertRepository.count())
            .availableAmbulances(ambulanceRepository.countByStatus("AVAILABLE"))
            .activeInterventions(interventionRepository.countByArchivedFalse())
            .build();
    }
}