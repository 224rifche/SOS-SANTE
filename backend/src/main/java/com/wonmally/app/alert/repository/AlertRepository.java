package com.wonmally.app.alert.repository;

import com.wonmally.app.alert.entity.Alert;
import com.wonmally.app.common.InterventionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);
    List<Alert> findByStatusOrderByCreatedAtAsc(InterventionStatus status);
}
