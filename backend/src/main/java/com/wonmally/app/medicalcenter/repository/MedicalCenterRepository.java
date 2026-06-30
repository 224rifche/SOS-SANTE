package com.wonmally.app.medicalcenter.repository;

import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalCenterRepository extends JpaRepository<MedicalCenter, UUID> {
    List<MedicalCenter> findByActiveTrue();
}
