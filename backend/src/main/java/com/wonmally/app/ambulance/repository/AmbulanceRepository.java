package com.wonmally.app.ambulance.repository;

import com.wonmally.app.ambulance.entity.Ambulance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AmbulanceRepository extends JpaRepository<Ambulance, UUID> {
    List<Ambulance> findByMedicalCenterIdAndStatus(UUID medicalCenterId, String status);
}
