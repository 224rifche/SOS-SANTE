package com.wonmally.app.intervention.entity;

import com.wonmally.app.alert.entity.Alert;
import com.wonmally.app.ambulance.entity.Ambulance;
import com.wonmally.app.common.BaseEntity;
import com.wonmally.app.common.InterventionStatus;
import com.wonmally.app.doctor.entity.Doctor;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entite Intervention - cycle de vie complet de la prise en charge
 * d'une alerte, de la validation jusqu'a l'archivage.
 */
@Entity
@Table(name = "interventions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intervention extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false, unique = true)
    private Alert alert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_center_id", nullable = false)
    private MedicalCenter medicalCenter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id")
    private Ambulance ambulance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 50)
    @Builder.Default
    private InterventionStatus currentStatus = InterventionStatus.ALERTE_CREEE;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "archived", nullable = false)
    @Builder.Default
    private Boolean archived = false;

    /**
     * Met a jour le statut courant de l'intervention.
     * La logique de transition (machine a etats) est validee au niveau du Service.
     */
    public void updateStatus(InterventionStatus newStatus) {
        this.currentStatus = newStatus;
    }
}
