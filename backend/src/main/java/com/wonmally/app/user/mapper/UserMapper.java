package com.wonmally.app.user.mapper;

import com.wonmally.app.user.dto.UpdateProfileRequestDTO;
import com.wonmally.app.user.dto.UserAdminResponseDTO;
import com.wonmally.app.user.dto.UserProfileResponseDTO;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserProfileResponseDTO toProfileResponse(User user) {
        Set<String> roleNames = user.getRoles().stream()
            .map((@NonNull Role r) -> r.getName())
            .collect(Collectors.toSet());

        Set<String> permissionCodes = user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map((@NonNull com.wonmally.app.user.entity.Permission p) -> p.getCode())
            .collect(Collectors.toSet());

        return UserProfileResponseDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .profilePicture(user.getProfilePicture())
            .roles(roleNames)
            .permissions(permissionCodes)
            .enabled(Boolean.TRUE.equals(user.getEnabled()))
            .verified(Boolean.TRUE.equals(user.getVerified()))
            .lastLogin(user.getLastLogin())
            .createdAt(user.getCreatedAt())
            .build();
    }

    public void updateEntityFromDto(User user, UpdateProfileRequestDTO dto) {
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setPhone(dto.phone());
    }

    public UserAdminResponseDTO toAdminResponse(User user) {
        Set<String> roleNames = user.getRoles().stream()
            .map((@NonNull Role r) -> r.getName())
            .collect(Collectors.toSet());

        return UserAdminResponseDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .roles(roleNames)
            .enabled(Boolean.TRUE.equals(user.getEnabled()))
            .verified(Boolean.TRUE.equals(user.getVerified()))
            .lastLogin(user.getLastLogin())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
