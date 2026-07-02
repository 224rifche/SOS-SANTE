package com.wonmally.app.medicalcenter.repository;

import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface MedicalCenterRepository extends JpaRepository<MedicalCenter, UUID>, JpaSpecificationExecutor<MedicalCenter> {
    List<MedicalCenter> findByActiveTrue();
    boolean existsByEmailIgnoreCase(String email);
}