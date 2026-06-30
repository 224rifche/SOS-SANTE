package com.wonmally.app.alert.repository;

import com.wonmally.app.alert.entity.EmergencyCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyCategoryRepository extends JpaRepository<EmergencyCategory, Long> {
}
