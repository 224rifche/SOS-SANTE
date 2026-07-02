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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogQueryService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper mapper;

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDTO> listLogs(UUID userId, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) ->
            userId == null ? cb.conjunction() : cb.equal(root.get("user").get("id"), userId);

        return auditLogRepository.findAll(spec, pageable).map(mapper::toResponse);
    }
}