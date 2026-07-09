import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/regulation.css";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { interventionService } from "../../services/interventionService";
import RegulationMap from "./RegulationMap";
import { validateAndAssignAmbulance } from "./alertWorkflow";
import {
  formatAlertCode,
  formatClock,
  formatGpsCoordinates,
  ambulanceStatusLabel,
  isAmbulanceAssignable,
} from "./regulationUtils";

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const AmbulanceIcon = ({ selected }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: selected ? "#10B981" : "#64748B" }}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    <line x1="8.5" y1="7" x2="8.5" y2="12" strokeWidth="1.5" />
    <line x1="6" y1="9.5" x2="11" y2="9.5" strokeWidth="1.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: "#10B981" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 11 11 13 15 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function AmbulanceAssignmentPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { connected, subscribe } = useWebSocket();

  const [alert, setAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbId, setSelectedAmbId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState("idle");
  const [time, setTime] = useState(formatClock());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertData, ambulancesRes, interventionData] = await Promise.all([
        alertService.getAlertById(alertId),
        ambulanceService.list({ size: 100 }),
        interventionService.getByAlertId(alertId),
      ]);
      setAlert(alertData);
      setAmbulances(ambulancesRes.content || []);
      setIntervention(interventionData);

      const available = (ambulancesRes.content || []).filter((a) => isAmbulanceAssignable(a.status));
      const preselected = interventionData.ambulanceId
        || available[0]?.id
        || "";
      setSelectedAmbId(preselected);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les données d'affectation.");
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
    if (!connected) return undefined;
    return subscribe("/topic/ambulances", (updatedAmbulance) => {
      setAmbulances((prev) => {
        const exists = prev.some((a) => a.id === updatedAmbulance.id);
        if (!exists) return [...prev, updatedAmbulance];
        return prev.map((a) => (a.id === updatedAmbulance.id ? updatedAmbulance : a));
      });
    });
  }, [connected, subscribe]);

  const sortedAmbulances = [...ambulances].sort((a, b) => {
    if (isAmbulanceAssignable(a.status) && !isAmbulanceAssignable(b.status)) return -1;
    if (!isAmbulanceAssignable(a.status) && isAmbulanceAssignable(b.status)) return 1;
    return (a.registrationNumber || "").localeCompare(b.registrationNumber || "");
  });

  const availableCount = ambulances.filter((a) => isAmbulanceAssignable(a.status)).length;
  const selectedAmbulance = ambulances.find((a) => a.id === selectedAmbId);

  useEffect(() => {
    if (selectedAmbulance && !isAmbulanceAssignable(selectedAmbulance.status)) {
      const nextAvailable = ambulances.find((a) => isAmbulanceAssignable(a.status));
      setSelectedAmbId(nextAvailable?.id || "");
    } else if (!selectedAmbulance && ambulances.length > 0) {
      const nextAvailable = ambulances.find((a) => isAmbulanceAssignable(a.status));
      if (nextAvailable) setSelectedAmbId(nextAvailable.id);
    }
  }, [ambulances, selectedAmbulance]);

  const handleConfirmAssignment = async () => {
    if (!selectedAmbulance || !isAmbulanceAssignable(selectedAmbulance.status) || !alert || !intervention) return;

    setDispatchStatus("dispatching");
    try {
      await validateAndAssignAmbulance(alert, intervention, selectedAmbulance.id);
      setDispatchStatus("success");
      toast.success(`${selectedAmbulance.registrationNumber} affectée à l'intervention.`);
      setTimeout(() => {
        navigate(`/medical-center/alerts/${alertId}/tracking`);
      }, 1200);
    } catch (err) {
      setDispatchStatus("idle");
      toast.error(err.response?.data?.message || "Échec de l'affectation.");
    }
  };

  if (loading) {
    return (
      <div className="ambulance-assignment-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !alert || !intervention) {
    return (
      <div className="ambulance-assignment-wrapper container py-5">
        <div className="alert alert-danger">{error || "Données d'affectation indisponibles."}</div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(`/medical-center/alerts/${alertId}`)}>
          Retour au détail
        </button>
      </div>
    );
  }

  const alertCode = formatAlertCode(alert.id);

  return (
    <div className="ambulance-assignment-wrapper">
      <style>{`
        @keyframes ambPulseDot {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .amb-waiting-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1.5rem;
          background: #fff;
          border-radius: 14px;
          border: 1px dashed #dee2e6;
        }
        .amb-waiting-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #dc3545;
          margin-bottom: 1rem;
          animation: ambPulseDot 1.4s ease-in-out infinite;
        }
        .amb-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .amb-live-pill.on { background: rgba(16,185,129,0.12); color: #10B981; }
        .amb-live-pill.off { background: rgba(220,53,69,0.1); color: #dc3545; }
        .amb-live-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      `}</style>

      <div className="assignment-page-header">
        <div className="header-left-group">
          <button type="button" className="back-circle-btn" onClick={() => navigate(`/medical-center/alerts/${alertId}`)} aria-label="Retour">
            <BackArrowIcon />
          </button>
          <div className="header-title-section">
            <h1 className="assignment-title">Affecter une ambulance</h1>
            <span className="alert-meta-tag">Alerte {alertCode}</span>
          </div>
        </div>
        <div className="header-right-group d-flex align-items-center gap-2">
          <span className={`amb-live-pill ${connected ? "on" : "off"}`}>
            <span className="dot" />
            {connected ? "Temps réel actif" : "Hors ligne"}
          </span>
          <span className="clock-pill">{time}</span>
        </div>
      </div>

      <div className="assignment-page-content-grid">
        <div className="assignment-left-column">
          <span className="assignment-section-subtitle">
            Ambulances disponibles {availableCount > 0 ? `(${availableCount})` : ""}
          </span>

          {sortedAmbulances.length === 0 ? (
            <div className="amb-waiting-state">
              <div className="amb-waiting-dot" />
              <h4 className="mb-1">Aucune ambulance dans le système</h4>
              <p className="text-secondary small mb-0">Vérifiez la flotte du centre médical.</p>
            </div>
          ) : availableCount === 0 ? (
            <div className="amb-waiting-state">
              <div className="amb-waiting-dot" />
              <h4 className="mb-1">En attente d'une ambulance disponible</h4>
              <p className="text-secondary small mb-0">
                Toutes les ambulances sont actuellement en mission. Cette page se mettra à jour automatiquement dès qu'une ambulance se libère.
              </p>
            </div>
          ) : (
            <div className="ambulance-cards-list">
              {sortedAmbulances.map((amb) => {
                const isSelected = amb.id === selectedAmbId;
                const isBusy = !isAmbulanceAssignable(amb.status);

                return (
                  <div
                    key={amb.id}
                    className={`ambulance-selection-card ${isSelected ? "selected" : ""} ${isBusy ? "busy" : ""}`}
                    onClick={() => !isBusy && setSelectedAmbId(amb.id)}
                  >
                    <div className="card-top-row">
                      <div className="amb-icon-wrapper">
                        <AmbulanceIcon selected={isSelected} />
                      </div>
                      <div className="amb-info-wrapper">
                        <h2 className="amb-name-title">{amb.registrationNumber}</h2>
                        <span className={`amb-status-meta ${isBusy ? "busy-text" : ""}`}>
                          {ambulanceStatusLabel(amb.status)}
                          {amb.medicalCenterName ? ` — ${amb.medicalCenterName}` : ""}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="checkmark-box"><CheckCircleIcon /></div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="card-bottom-metrics-row">
                        <div className="metric-box">
                          <span className="metric-val-bold">{amb.model || "—"}</span>
                          <span className="metric-lbl-txt">Modèle</span>
                        </div>
                        <div className="metric-box">
                          <span className="metric-val-bold green-txt">{ambulanceStatusLabel(amb.status)}</span>
                          <span className="metric-lbl-txt">Statut</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mobile-action-button-container">
            <button
              type="button"
              className="action-confirm-assign-btn"
              disabled={!selectedAmbulance || !isAmbulanceAssignable(selectedAmbulance.status) || dispatchStatus !== "idle"}
              onClick={handleConfirmAssignment}
            >
              <span>Assigner {selectedAmbulance ? selectedAmbulance.registrationNumber : "une ambulance"}</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        <div className="assignment-right-column">
          <div className="route-detail-panel-card">
            <h3 className="route-panel-title">Carte et itinéraire</h3>

            {dispatchStatus === "idle" && selectedAmbulance && (
              <div className="route-panel-body">
                <div style={{ minHeight: "320px", borderRadius: "12px", overflow: "hidden" }}>
                  <RegulationMap alerts={[alert]} ambulances={[selectedAmbulance]} tall />
                </div>

                <div className="route-stats-summary">
                  <div className="route-stat-item">
                    <span className="route-stat-lbl">Ambulance sélectionnée</span>
                    <span className="route-stat-val">{selectedAmbulance.registrationNumber}</span>
                  </div>
                  <div className="route-stat-item">
                    <span className="route-stat-lbl">Centre rattaché</span>
                    <span className="route-stat-val">{selectedAmbulance.medicalCenterName || "—"}</span>
                  </div>
                  <div className="route-stat-item">
                    <span className="route-stat-lbl">Destination patient</span>
                    <span className="route-stat-val">{alert.address || formatGpsCoordinates(alert.latitude, alert.longitude)}</span>
                  </div>
                </div>

                <button type="button" className="action-confirm-assign-btn desktop-only-btn" onClick={handleConfirmAssignment}>
                  <span>Assigner {selectedAmbulance.registrationNumber}</span>
                  <ArrowRightIcon />
                </button>
              </div>
            )}

            {dispatchStatus === "idle" && !selectedAmbulance && (
              <div className="route-panel-body">
                <div className="amb-waiting-state" style={{ minHeight: "320px" }}>
                  <div className="amb-waiting-dot" />
                  <h4 className="mb-1">Aucune ambulance sélectionnée</h4>
                  <p className="text-secondary small mb-0">La carte s'affichera dès qu'une ambulance sera disponible et sélectionnée.</p>
                </div>
              </div>
            )}

            {dispatchStatus === "dispatching" && (
              <div className="assigning-state-overlay">
                <div className="spinner-loader" />
                <h4>Envoi de la feuille de mission...</h4>
                <p>Transmission de l'affectation à l'équipage.</p>
              </div>
            )}

            {dispatchStatus === "success" && (
              <div className="assigning-state-overlay success">
                <div className="success-badge-circle">✓</div>
                <h4>Équipe mobilisée</h4>
                <p>{selectedAmbulance?.registrationNumber} a démarré l'intervention.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}