package com.wonmally.app.intervention.repository;

import com.wonmally.app.intervention.entity.MedicalNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalNoteRepository extends JpaRepository<MedicalNote, UUID> {
    List<MedicalNote> findByInterventionId(UUID interventionId);
}
