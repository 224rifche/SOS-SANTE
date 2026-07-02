package com.wonmally.app.ambulancier.repository;

import com.wonmally.app.ambulancier.entity.Ambulancier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface AmbulancierRepository extends JpaRepository<Ambulancier, UUID>, JpaSpecificationExecutor<Ambulancier> {
    Optional<Ambulancier> findByUserId(UUID userId);
    boolean existsByMatriculeIgnoreCase(String matricule);
    boolean existsByUserId(UUID userId);
}