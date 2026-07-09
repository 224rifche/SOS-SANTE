package com.wonmally.app.alert.service;

import com.wonmally.app.alert.dto.CreateEmergencyCategoryRequestDTO;
import com.wonmally.app.alert.dto.EmergencyCategoryResponseDTO;
import com.wonmally.app.alert.dto.UpdateEmergencyCategoryRequestDTO;
import com.wonmally.app.alert.entity.EmergencyCategory;
import com.wonmally.app.alert.mapper.EmergencyCategoryMapper;
import com.wonmally.app.alert.repository.AlertRepository;
import com.wonmally.app.alert.repository.EmergencyCategoryRepository;
import com.wonmally.app.exception.ResourceConflictException;
import com.wonmally.app.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EmergencyCategoryService {

    private final EmergencyCategoryRepository categoryRepository;
    private final AlertRepository alertRepository;
    private final EmergencyCategoryMapper mapper;

    @Transactional(readOnly = true)
    public List<EmergencyCategoryResponseDTO> listCategories() {
        return categoryRepository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public EmergencyCategoryResponseDTO getCategoryById(Long id) {
        EmergencyCategory category = categoryRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Categorie d'urgence introuvable"));
        return mapper.toResponse(category);
    }

    @Transactional
    public EmergencyCategoryResponseDTO createCategory(CreateEmergencyCategoryRequestDTO dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.name())) {
            throw new ResourceConflictException("Une categorie avec ce nom existe deja");
        }

        EmergencyCategory category = EmergencyCategory.builder()
            .name(dto.name())
            .priority(dto.priority())
            .description(dto.description())
            .build();

        return mapper.toResponse(Objects.requireNonNull(categoryRepository.save(category)));
    }

    @Transactional
    public EmergencyCategoryResponseDTO updateCategory(Long id, UpdateEmergencyCategoryRequestDTO dto) {
        EmergencyCategory category = categoryRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Categorie d'urgence introuvable"));

        if (!category.getName().equalsIgnoreCase(dto.name())
                && categoryRepository.existsByNameIgnoreCase(dto.name())) {
            throw new ResourceConflictException("Une categorie avec ce nom existe deja");
        }

        mapper.updateEntityFromDto(category, dto);
        return mapper.toResponse(Objects.requireNonNull(categoryRepository.save(category)));
    }

    @Transactional
    public void deleteCategory(Long id) {
        EmergencyCategory category = categoryRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Categorie d'urgence introuvable"));

        if (alertRepository.existsByCategoryId(id)) {
            throw new ResourceConflictException(
                "Impossible de supprimer cette categorie : des alertes y sont associees");
        }

        categoryRepository.delete(Objects.requireNonNull(category));
    }
}