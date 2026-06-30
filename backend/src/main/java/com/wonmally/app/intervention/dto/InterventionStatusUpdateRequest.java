package com.wonmally.app.intervention.dto;

import com.wonmally.app.common.InterventionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InterventionStatusUpdateRequest {

    @NotNull
    private InterventionStatus newStatus;

    /** Optionnel : UUID de l'ambulance a affecter (transition AMBULANCE_AFFECTEE). */
    private UUID ambulanceId;

    /** Optionnel : UUID du medecin a assigner (transition MEDECIN_ASSIGNE). */
    private UUID doctorId;
}
