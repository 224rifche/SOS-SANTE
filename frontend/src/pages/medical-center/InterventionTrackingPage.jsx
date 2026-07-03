import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { interventionService } from "../../services/interventionService";
import { useWebSocket } from "../../contexts/WebSocketContext";
import RegulationMap from "./RegulationMap";
import {
  formatAlertCode,
  formatClock,
  TRACKING_TIMELINE,
  getTimelineStepIndex,
  statusLabel,
} from "./regulationUtils";

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const AmbulanceIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "white" }}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const NavigationArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

function formatStepTime(stepState, alert, intervention) {
  if (stepState !== "completed" && stepState !== "active") return "En attente";
  if (stepState === "active") return "En cours";
  if (intervention?.startedAt) {
    return new Date(intervention.startedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (alert?.createdAt) {
    return new Date(alert.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return "—";
}

function bannerTitle(intervention, alert) {
  const status = intervention?.currentStatus || alert?.status;
  const team = intervention?.ambulanceRegistrationNumber || "Ambulance";
  if (status === "AMBULANCE_EN_ROUTE") return `${team} en route`;
  if (status === "ARRIVEE_SUR_LES_LIEUX" || status === "PATIENT_PRIS_EN_CHARGE") return `${team} sur place`;
  if (status === "TRANSPORT_VERS_CENTRE" || status === "ARRIVEE_AUX_URGENCES") return `${team} — transport CHU`;
  if (status === "AMBULANCE_AFFECTEE") return `${team} affectée`;
  return statusLabel(status);
}

export default function InterventionTrackingPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { connected, subscribe } = useWebSocket();

  const [alert, setAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(formatClock());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertData, interventionData, ambulancesRes] = await Promise.all([
        alertService.getAlertById(alertId),
        interventionService.getByAlertId(alertId),
        ambulanceService.list({ size: 100 }),
      ]);
      setAlert(alertData);
      setIntervention(interventionData);
      setAmbulances(ambulancesRes.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger le suivi de l'intervention.");
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => setTime(formatClock()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!connected || !intervention?.id) return undefined;
    const unsub = subscribe(`/topic/interventions/${intervention.id}`, (updated) => {
      setIntervention(updated);
    });
    const unsubAll = subscribe("/topic/interventions", (updated) => {
      if (updated.id === intervention.id) setIntervention(updated);
    });
    return () => { unsub(); unsubAll(); };
  }, [connected, subscribe, intervention?.id]);

  if (loading) {
    return (
      <div className="intervention-tracking-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !alert || !intervention) {
    return (
      <div className="intervention-tracking-wrapper container py-5">
        <div className="alert alert-danger">{error || "Suivi indisponible."}</div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/medical-center")}>
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const alertCode = formatAlertCode(alert.id);
  const patientName = `${alert.citizenFirstName || ""} ${alert.citizenLastName || ""}`.trim() || "Patient";
  const patientLocation = alert.address?.split(",")[0] || "Lieu de l'urgence";
  const currentStatus = intervention.currentStatus || alert.status;
  const assignedAmbulance = ambulances.find((a) => a.id === intervention.ambulanceId);
  const mapAmbulances = assignedAmbulance ? [assignedAmbulance] : [];

  return (
    <div className="intervention-tracking-wrapper">
      <div className="tracking-page-header">
        <div className="header-left-group">
          <button type="button" className="back-circle-btn" onClick={() => navigate("/medical-center")} aria-label="Retour">
            <BackArrowIcon />
          </button>
          <div className="header-title-section">
            <h1 className="tracking-title">Suivi {alertCode}</h1>
            <span className="live-pill">• {connected ? "Suivi en temps réel" : "Reconnexion..."}</span>
          </div>
        </div>
        <div className="header-right-group">
          <span className="clock-pill">{time}</span>
        </div>
      </div>

      <div className="tracking-page-content-grid">
        <div className="tracking-left-column">
          <div className="status-blue-banner">
            <div className="banner-left-info">
              <div className="banner-icon-bg"><AmbulanceIcon /></div>
              <div className="banner-text-block">
                <h2 className="banner-main-title">{bannerTitle(intervention, alert)}</h2>
                <span className="banner-sub-info">{patientName} • {patientLocation}</span>
              </div>
            </div>
            <div className="banner-right-eta">
              <span className="eta-big-num">{statusLabel(currentStatus).split(" ")[0]}</span>
              <span className="eta-unit-label">statut</span>
            </div>
          </div>

          <div className="tracking-stepper-card">
            <h3 className="stepper-section-title">Progression</h3>
            <div className="stepper-timeline-list">
              {TRACKING_TIMELINE.map((step, index) => {
                const stepState = getTimelineStepIndex(step, currentStatus);
                const isCompleted = stepState === "completed";
                const isActive = stepState === "active";
                const isPending = stepState === "pending";

                return (
                  <div key={step.title} className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                    <div className="stepper-node-container">
                      {isCompleted && (
                        <div className="node-icon completed-node"><CheckIcon /></div>
                      )}
                      {isActive && (
                        <div className="node-icon active-node"><NavigationArrowIcon /></div>
                      )}
                      {isPending && <div className="node-icon pending-node" />}
                      {index < TRACKING_TIMELINE.length - 1 && (
                        <div className={`node-connection-line ${isCompleted ? "completed-line" : ""}`} />
                      )}
                    </div>
                    <div className="stepper-text-container">
                      <div className="stepper-title-row">
                        <span className="step-title-txt">{step.title}</span>
                        <span className="step-time-txt">{formatStepTime(stepState, alert, intervention)}</span>
                      </div>
                      <p className="step-desc-txt">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {intervention.medicalCenterName && (
            <div className="tracking-stepper-card mt-3">
              <h3 className="stepper-section-title">Centre médical</h3>
              <p className="mb-0 small">{intervention.medicalCenterName}</p>
              {intervention.doctorName && (
                <p className="mb-0 small text-secondary mt-1">Médecin : {intervention.doctorName}</p>
              )}
            </div>
          )}
        </div>

        <div className="tracking-right-column">
          <div className="tracking-map-panel">
            <h3 className="map-panel-title">Position en direct des secours</h3>
            <div style={{ minHeight: "360px", borderRadius: "12px", overflow: "hidden" }}>
              <RegulationMap alerts={[alert]} ambulances={mapAmbulances} tall />
            </div>

            {assignedAmbulance && (
              <div className="crew-info-card">
                <span className="crew-label">Ambulance mobilisée</span>
                <div className="crew-member-item">
                  <span className="crew-avatar">🚑</span>
                  <div>
                    <div className="crew-name">{assignedAmbulance.registrationNumber}</div>
                    <div className="crew-desc">
                      {assignedAmbulance.model || "Véhicule de secours"} — {assignedAmbulance.medicalCenterName || "Centre médical"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
