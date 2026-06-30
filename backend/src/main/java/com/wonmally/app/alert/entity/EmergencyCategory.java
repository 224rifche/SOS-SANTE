package com.wonmally.app.alert.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
