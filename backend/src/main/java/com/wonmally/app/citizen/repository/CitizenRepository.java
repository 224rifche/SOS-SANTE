package com.wonmally.app.citizen.repository;

import com.wonmally.app.citizen.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CitizenRepository extends JpaRepository<Citizen, UUID> {
    Optional<Citizen> findByUserId(UUID userId);
}
