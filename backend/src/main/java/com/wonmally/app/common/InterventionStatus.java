package com.wonmally.app.common;

/**
 * Statuts officiels du workflow d'une alerte / intervention medicale.
 * Reference : Phase 5 - Modele Conceptuel des Donnees (MCD).
 */
public enum InterventionStatus {
    ALERTE_CREEE,
    EN_ATTENTE_VALIDATION,
    VALIDEE,
    AMBULANCE_AFFECTEE,
    AMBULANCE_EN_ROUTE,
    ARRIVEE_SUR_LES_LIEUX,
    PATIENT_PRIS_EN_CHARGE,
    TRANSPORT_VERS_CENTRE,
    ARRIVEE_AUX_URGENCES,
    MEDECIN_ASSIGNE,
    PRISE_EN_CHARGE_MEDICALE_EN_COURS,
    PRISE_EN_CHARGE_MEDICALE_TERMINEE,
    INTERVENTION_CLOTUREE,
    ARCHIVEE,
    REJETEE
}
