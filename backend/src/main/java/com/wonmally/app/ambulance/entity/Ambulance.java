package com.wonmally.app.ambulance.entity;

import com.wonmally.app.common.BaseEntity;
import com.wonmally.app.medicalcenter.entity.MedicalCenter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ambulances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ambulance extends BaseEntity {

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "AVAILABLE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_center_id", nullable = false)
    private MedicalCenter medicalCenter;

    @Column(name = "gps_latitude", precision = 10, scale = 8)
    private BigDecimal gpsLatitude;

    @Column(name = "gps_longitude", precision = 11, scale = 8)
    private BigDecimal gpsLongitude;
}
