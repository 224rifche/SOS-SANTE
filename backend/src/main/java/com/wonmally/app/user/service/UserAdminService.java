package com.wonmally.app.user.service;

import com.wonmally.app.audit.service.AuditService;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.exception.EmailAlreadyExistsException;
import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.user.dto.*;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.mapper.UserMapper;
import com.wonmally.app.user.repository.RoleRepository;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.user.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<UserAdminResponseDTO> listUsers(String roleName, Boolean enabled, String search, Pageable pageable) {
        Specification<User> spec = Specification.where(UserSpecification.notDeleted())
            .and(UserSpecification.hasRole(roleName))
            .and(UserSpecification.isEnabled(enabled))
            .and(UserSpecification.search(search));

        return userRepository.findAll(spec, Objects.requireNonNull(pageable)).map(userMapper::toAdminResponse);
    }

    @Transactional(readOnly = true)
    public UserAdminResponseDTO getUserById(UUID id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return userMapper.toAdminResponse(user);
    }

    @Transactional
    public UserAdminResponseDTO createUser(CreateUserRequestDTO dto) {
        if (userRepository.existsByEmailAndDeletedFalse(dto.email())) {
            throw new EmailAlreadyExistsException("Cet email est deja utilise");
        }

        Set<Role> roles = resolveRoles(dto.roleNames());

        User user = User.builder()
            .email(dto.email())
            .password(passwordEncoder.encode(dto.password()))
            .firstName(dto.firstName())
            .lastName(dto.lastName())
            .phone(dto.phone())
            .roles(roles)
            .enabled(true)
            .verified(true)
            .build();

        User saved = Objects.requireNonNull(userRepository.save(user));
        logCurrentAdminAction("USER_CREATED", saved.getId());
        return userMapper.toAdminResponse(saved);
    }

    @Transactional
    public UserAdminResponseDTO updateUser(UUID id, UpdateUserRequestDTO dto) {
        User user = userRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setPhone(dto.phone());

        User saved = userRepository.save(user);
        logCurrentAdminAction("USER_UPDATED", saved.getId());
        return userMapper.toAdminResponse(saved);
    }

    @Transactional
    public UserAdminResponseDTO updateStatus(UUID id, UpdateUserStatusRequestDTO dto) {
        User user = userRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        user.setEnabled(dto.enabled());
        User saved = userRepository.save(user);
        logCurrentAdminAction(dto.enabled() ? "USER_ENABLED" : "USER_DISABLED", saved.getId());
        return userMapper.toAdminResponse(saved);
    }

    @Transactional
    public UserAdminResponseDTO updateRoles(UUID id, UpdateUserRolesRequestDTO dto) {
        User user = userRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        user.setRoles(resolveRoles(dto.roleNames()));
        User saved = userRepository.save(user);
        logCurrentAdminAction("USER_ROLES_UPDATED", saved.getId());
        return userMapper.toAdminResponse(saved);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setEnabled(false);
        userRepository.save(user);
        logCurrentAdminAction("USER_DELETED", id);
    }

    private void logCurrentAdminAction(String action, UUID entityId) {
        try {
            String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            auditService.logAction(action, admin, "USER", entityId);
        } catch (Exception ignored) {
            // L'audit ne doit jamais casser le flux principal
        }
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = roleRepository.findByNameIn(roleNames);
        if (roles.size() != roleNames.size()) {
            Set<String> found = roles.stream().map((@org.springframework.lang.NonNull Role r) -> r.getName()).collect(Collectors.toSet());
            Set<String> missing = roleNames.stream()
                .filter(name -> !found.contains(name))
                .collect(Collectors.toSet());
            throw new BadRequestException("Role(s) introuvable(s) : " + missing);
        }
        return roles;
    }
}