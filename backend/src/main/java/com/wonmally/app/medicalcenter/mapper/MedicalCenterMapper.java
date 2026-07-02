package com.wonmally.app.medicalcenter.mapper;

import com.wonmally.app.medicalcenter.dto.MedicalCenterResponseDTO;
import com.wonmally.app.medicalcenter.dto.UpdateMedicalCenterRequestDTO;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import org.springframework.stereotype.Component;

@Component
public class MedicalCenterMapper {

    public MedicalCenterResponseDTO toResponse(MedicalCenter center) {
        return MedicalCenterResponseDTO.builder()
            .id(center.getId())
            .name(center.getName())
            .email(center.getEmail())
            .phone(center.getPhone())
            .address(center.getAddress())
            .latitude(center.getLatitude())
            .longitude(center.getLongitude())
            .emergencyCapacity(center.getEmergencyCapacity())
            .active(center.getActive())
            .build();
    }

    public void updateEntityFromDto(MedicalCenter center, UpdateMedicalCenterRequestDTO dto) {
        center.setName(dto.name());
        center.setPhone(dto.phone());
        center.setAddress(dto.address());
        center.setLatitude(dto.latitude());
        center.setLongitude(dto.longitude());
        center.setEmergencyCapacity(dto.emergencyCapacity());
    }
}