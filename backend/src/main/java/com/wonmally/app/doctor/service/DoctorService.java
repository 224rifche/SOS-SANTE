package com.wonmally.app.doctor.service;

import com.wonmally.app.doctor.dto.*;
import com.wonmally.app.doctor.entity.Doctor;
import com.wonmally.app.doctor.mapper.DoctorMapper;
import com.wonmally.app.doctor.repository.DoctorRepository;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceConflictException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.medicalcenter.repository.MedicalCenterRepository;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final MedicalCenterRepository medicalCenterRepository;
    private final UserRepository userRepository;
    private final DoctorMapper mapper;

    private static final Set<String> VALID_STATUSES = Set.of(
        "OFF_DUTY", "ON_DUTY", "IN_CONSULTATION", "BREAK"
    );

    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> listDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medecin introuvable"));
        return mapper.toResponse(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorResponseDTO getMyProfile(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profil medecin introuvable"));
        return mapper.toResponse(doctor);
    }

    @Transactional
    public DoctorResponseDTO createDoctor(CreateDoctorRequestDTO dto) {
        if (doctorRepository.existsByUserId(dto.userId())) {
            throw new ResourceConflictException("Cet utilisateur a deja un profil medecin");
        }

        if (doctorRepository.existsByLicenseNumberIgnoreCase(dto.licenseNumber())) {
            throw new ResourceConflictException("Ce numero de licence est deja utilise");
        }

        User user = userRepository.findById(dto.userId())
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        MedicalCenter medicalCenter = medicalCenterRepository.findById(dto.medicalCenterId())
            .orElseThrow(() -> new ResourceNotFoundException("Centre medical introuvable"));

        Doctor doctor = Doctor.builder()
            .user(user)
            .medicalCenter(medicalCenter)
            .specialty(dto.specialty())
            .licenseNumber(dto.licenseNumber())
            .available(true)
            .status("OFF_DUTY")
            .build();

        return mapper.toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponseDTO updateStatus(UUID id, UpdateDoctorStatusRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medecin introuvable"));

        String newStatus = dto.status().toUpperCase();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Statut invalide. Valeurs autorisees : " + VALID_STATUSES);
        }

        doctor.setStatus(newStatus);
        return mapper.toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponseDTO updateAvailability(UUID id, UpdateDoctorAvailabilityRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medecin introuvable"));

        doctor.setAvailable(dto.available());
        return mapper.toResponse(doctorRepository.save(doctor));
    }
}