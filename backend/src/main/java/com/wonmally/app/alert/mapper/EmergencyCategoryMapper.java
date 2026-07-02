package com.wonmally.app.alert.mapper;

import com.wonmally.app.alert.dto.EmergencyCategoryResponseDTO;
import com.wonmally.app.alert.dto.UpdateEmergencyCategoryRequestDTO;
import com.wonmally.app.alert.entity.EmergencyCategory;
import org.springframework.stereotype.Component;

@Component
public class EmergencyCategoryMapper {

    public EmergencyCategoryResponseDTO toResponse(EmergencyCategory category) {
        return EmergencyCategoryResponseDTO.builder()
            .id(category.getId())
            .name(category.getName())
            .priority(category.getPriority())
            .description(category.getDescription())
            .build();
    }

    public void updateEntityFromDto(EmergencyCategory category, UpdateEmergencyCategoryRequestDTO dto) {
        category.setName(dto.name());
        category.setPriority(dto.priority());
        category.setDescription(dto.description());
    }
}