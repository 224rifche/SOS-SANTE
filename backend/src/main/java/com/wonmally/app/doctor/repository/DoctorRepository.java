package com.wonmally.app.doctor.repository;

import com.wonmally.app.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID>, JpaSpecificationExecutor<Doctor> {
    Optional<Doctor> findByUserId(UUID userId);
    List<Doctor> findByMedicalCenterIdAndAvailableTrue(UUID medicalCenterId);
    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);
    boolean existsByUserId(UUID userId);
}