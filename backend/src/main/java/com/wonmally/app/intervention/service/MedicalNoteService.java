package com.wonmally.app.intervention.service;

import com.wonmally.app.doctor.entity.Doctor;
import com.wonmally.app.doctor.repository.DoctorRepository;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.intervention.dto.CreateMedicalNoteRequestDTO;
import com.wonmally.app.intervention.dto.MedicalNoteResponseDTO;
import com.wonmally.app.intervention.entity.Intervention;
import com.wonmally.app.intervention.entity.MedicalNote;
import com.wonmally.app.intervention.mapper.MedicalNoteMapper;
import com.wonmally.app.intervention.repository.InterventionRepository;
import com.wonmally.app.intervention.repository.MedicalNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalNoteService {

    private final MedicalNoteRepository medicalNoteRepository;
    private final InterventionRepository interventionRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalNoteMapper mapper;

    @Transactional
    public MedicalNoteResponseDTO createNote(UUID doctorUserId, CreateMedicalNoteRequestDTO dto) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Profil medecin introuvable"));

        Intervention intervention = interventionRepository.findById(Objects.requireNonNull(dto.interventionId()))
            .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable"));

        MedicalNote note = MedicalNote.builder()
            .intervention(intervention)
            .doctor(doctor)
            .diagnosis(dto.diagnosis())
            .observations(dto.observations())
            .build();

        return mapper.toResponse(Objects.requireNonNull(medicalNoteRepository.save(note)));
    }

    @Transactional(readOnly = true)
    public List<MedicalNoteResponseDTO> getNotesByIntervention(UUID interventionId) {
        return medicalNoteRepository.findByInterventionIdOrderByCreatedAtDesc(interventionId).stream()
            .map(mapper::toResponse)
            .toList();
    }
}