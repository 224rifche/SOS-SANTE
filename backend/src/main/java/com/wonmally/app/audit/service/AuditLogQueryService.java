package com.wonmally.app.audit.service;

import com.wonmally.app.audit.dto.AuditLogResponseDTO;
import com.wonmally.app.audit.entity.AuditLog;
import com.wonmally.app.audit.mapper.AuditLogMapper;
import com.wonmally.app.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogQueryService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper mapper;

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDTO> listLogs(UUID userId, String action, LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
            }
            if (dateFrom != null) {
                LocalDateTime from = dateFrom.atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (dateTo != null) {
                LocalDateTime to = dateTo.atTime(LocalTime.MAX);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return auditLogRepository.findAll(spec, Objects.requireNonNull(pageable)).map(mapper::toResponse);
    }
}