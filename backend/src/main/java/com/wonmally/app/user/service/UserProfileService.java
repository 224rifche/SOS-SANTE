package com.wonmally.app.user.service;

import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.user.dto.ChangePasswordRequestDTO;
import com.wonmally.app.user.dto.UpdateProfileRequestDTO;
import com.wonmally.app.user.dto.UserProfileResponseDTO;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.mapper.UserMapper;
import com.wonmally.app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponseDTO getCurrentProfile(@NonNull UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return userMapper.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponseDTO updateProfile(@NonNull UUID userId, UpdateProfileRequestDTO dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        userMapper.updateEntityFromDto(user, dto);
        return userMapper.toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(@NonNull UUID userId, ChangePasswordRequestDTO dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(dto.oldPassword(), user.getPassword())) {
            throw new BadRequestException("Ancien mot de passe incorrect");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }
}