package com.wonmally.app.ambulancier.repository;

import com.wonmally.app.ambulancier.entity.Ambulancier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AmbulancierRepository extends JpaRepository<Ambulancier, UUID> {
    Optional<Ambulancier> findByUserId(UUID userId);
}
