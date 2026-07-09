package com.wonmally.app.intervention.repository;

import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.intervention.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterventionRepository extends JpaRepository<Intervention, UUID> {
    Optional<Intervention> findByAlertId(UUID alertId);
    List<Intervention> findByMedicalCenterIdAndCurrentStatusNot(UUID medicalCenterId, InterventionStatus status);
    List<Intervention> findByDoctorId(UUID doctorId);
    List<Intervention> findByAmbulanceId(UUID ambulanceId);
    long countByArchivedFalse();
    Optional<Intervention> findFirstByAmbulanceIdAndCompletedAtIsNullAndArchivedFalse(UUID ambulanceId);
}