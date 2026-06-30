package com.wonmally.app.alert.repository;

import com.wonmally.app.alert.entity.VoiceNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VoiceNoteRepository extends JpaRepository<VoiceNote, UUID> {
}
