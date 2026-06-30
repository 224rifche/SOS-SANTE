package com.wonmally.app.alert.entity;

import com.wonmally.app.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "voice_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    @Column(name = "file_path", nullable = false, length = 255)
    private String filePath;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "language", length = 50)
    private String language;
}
