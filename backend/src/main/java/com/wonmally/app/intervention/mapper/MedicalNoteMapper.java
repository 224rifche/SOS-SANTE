package com.wonmally.app.intervention.mapper;

import com.wonmally.app.intervention.dto.MedicalNoteResponseDTO;
import com.wonmally.app.intervention.entity.MedicalNote;
import org.springframework.stereotype.Component;

@Component
public class MedicalNoteMapper {

    public MedicalNoteResponseDTO toResponse(MedicalNote note) {
        return MedicalNoteResponseDTO.builder()
            .id(note.getId())
            .interventionId(note.getIntervention().getId())
            .doctorId(note.getDoctor().getId())
            .doctorName(note.getDoctor().getUser().getFirstName() + " " + note.getDoctor().getUser().getLastName())
            .diagnosis(note.getDiagnosis())
            .observations(note.getObservations())
            .createdAt(note.getCreatedAt())
            .build();
    }
}