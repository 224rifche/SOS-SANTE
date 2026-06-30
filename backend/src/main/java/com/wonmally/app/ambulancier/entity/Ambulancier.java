package com.wonmally.app.ambulancier.entity;

import com.wonmally.app.common.BaseEntity;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import com.wonmally.app.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ambulanciers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ambulancier extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_center_id", nullable = false)
    private MedicalCenter medicalCenter;

    @Column(name = "matricule", nullable = false, unique = true, length = 50)
    private String matricule;

    @Column(name = "available", nullable = false)
    @Builder.Default
    private Boolean available = true;

    @Column(name = "current_status", nullable = false, length = 50)
    @Builder.Default
    private String currentStatus = "OFF_DUTY";
}
