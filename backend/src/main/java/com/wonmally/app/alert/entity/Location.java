package com.wonmally.app.alert.entity;

import com.wonmally.app.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location extends BaseEntity {

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "source", nullable = false, length = 50)
    @Builder.Default
    private String source = "GPS";

    @Column(name = "accuracy", precision = 10, scale = 2)
    private BigDecimal accuracy;
}
