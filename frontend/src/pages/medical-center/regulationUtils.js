// Utilitaires partages par les pages du Centre de regulation.

/** priority=1 -> P1 (critique) ... priority>=3 -> P3, cf. echelle des categories d'urgence en base. */
export function priorityLabel(priority) {
  if (priority === 1) return "P1";
  if (priority === 2) return "P2";
  return "P3";
}

export function priorityClass(priority) {
  if (priority === 1) return "priority-1";
  if (priority === 2) return "priority-2";
  return "priority-3";
}

const ACTIVE_STATUSES = new Set([
  "EN_ATTENTE_VALIDATION",
  "VALIDEE",
  "AMBULANCE_AFFECTEE",
  "AMBULANCE_EN_ROUTE",
  "ARRIVEE_SUR_LES_LIEUX",
  "MEDECIN_ASSIGNE",
]);

export function isActiveAlertStatus(status) {
  return ACTIVE_STATUSES.has(status);
}

const STATUS_LABELS = {
  ALERTE_CREEE: "Alerte creee",
  EN_ATTENTE_VALIDATION: "En attente",
  VALIDEE: "Validee",
  AMBULANCE_AFFECTEE: "Affectee",
  AMBULANCE_EN_ROUTE: "En route",
  ARRIVEE_SUR_LES_LIEUX: "Sur place",
  MEDECIN_ASSIGNE: "Medecin assigne",
  INTERVENTION_CLOTUREE: "Cloturee",
  ARCHIVEE: "Archivee",
  REJETEE: "Rejetee",
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function formatElapsed(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH} h ${diffMin % 60} min`;
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatAlertCode(alertId) {
  if (!alertId) return "#NE-????";
  return `#NE-${String(alertId).replace(/-/g, "").substring(0, 4).toUpperCase()}`;
}

export function priorityFullLabel(priority) {
  if (priority === 1) return "Priorité critique";
  if (priority === 2) return "Priorité haute";
  return "Priorité standard";
}

export function formatGpsCoordinates(latitude, longitude) {
  if (latitude == null || longitude == null) return "—";
  return `${Number(latitude).toFixed(4)}° N — ${Math.abs(Number(longitude)).toFixed(4)}° O`;
}

const STATUS_ORDER = [
  "ALERTE_CREEE",
  "EN_ATTENTE_VALIDATION",
  "VALIDEE",
  "AMBULANCE_AFFECTEE",
  "AMBULANCE_EN_ROUTE",
  "ARRIVEE_SUR_LES_LIEUX",
  "PATIENT_PRIS_EN_CHARGE",
  "TRANSPORT_VERS_CENTRE",
  "ARRIVEE_AUX_URGENCES",
  "MEDECIN_ASSIGNE",
  "PRISE_EN_CHARGE_MEDICALE_EN_COURS",
  "PRISE_EN_CHARGE_MEDICALE_TERMINEE",
  "INTERVENTION_CLOTUREE",
  "ARCHIVEE",
];

export const TRACKING_TIMELINE = [
  {
    title: "Alerte reçue & validée",
    description: "Appel d'urgence qualifié et catégorisé par la régulation.",
    statuses: ["ALERTE_CREEE", "EN_ATTENTE_VALIDATION", "VALIDEE"],
  },
  {
    title: "Ambulance affectée",
    description: "Équipage mobilisé et véhicule assigné à l'intervention.",
    statuses: ["AMBULANCE_AFFECTEE"],
  },
  {
    title: "En route vers le patient",
    description: "Le véhicule est en déplacement prioritaire vers le lieu de l'urgence.",
    statuses: ["AMBULANCE_EN_ROUTE"],
  },
  {
    title: "Prise en charge sur place",
    description: "Premiers soins d'urgence prodigués sur site par l'équipage.",
    statuses: ["ARRIVEE_SUR_LES_LIEUX", "PATIENT_PRIS_EN_CHARGE"],
  },
  {
    title: "Transport vers le centre médical",
    description: "Transfert sécurisé du patient vers le service des urgences.",
    statuses: ["TRANSPORT_VERS_CENTRE", "ARRIVEE_AUX_URGENCES"],
  },
];

export function getStatusOrderIndex(status) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function getTimelineStepIndex(step, currentStatus) {
  const currentIdx = getStatusOrderIndex(currentStatus);
  const stepMaxIdx = Math.max(...step.statuses.map((s) => getStatusOrderIndex(s)));
  const stepMinIdx = Math.min(...step.statuses.map((s) => getStatusOrderIndex(s)));
  if (currentIdx > stepMaxIdx) return "completed";
  if (currentIdx >= stepMinIdx && currentIdx <= stepMaxIdx) return "active";
  return "pending";
}

export function ambulanceStatusLabel(status) {
  const labels = {
    AVAILABLE: "Disponible",
    EN_ROUTE: "En route",
    ON_MISSION: "En intervention",
    MAINTENANCE: "Maintenance",
    OUT_OF_SERVICE: "Hors service",
  };
  return labels[status] || status;
}

export function isAmbulanceAssignable(status) {
  return status === "AVAILABLE";
}
