import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/regulation.css";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { interventionService } from "../../services/interventionService";
import { doctorService } from "../../services/doctorService";
import { useWebSocket } from "../../contexts/WebSocketContext";
import RegulationMap from "./RegulationMap";
import { validateAndAssignAmbulance } from "./alertWorkflow";
import {
  formatAlertCode,
  formatClock,
  formatGpsCoordinates,
  priorityFullLabel,
  ambulanceStatusLabel,
  isAmbulanceAssignable,
} from "./regulationUtils";

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: "#0A55C4" }}>
    <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.27 1.1l-2.18 2.11z" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#EF4444" }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#EF4444" }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const AmbulanceIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export default function AlertDetailPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { connected, subscribe } = useWebSocket();

  const [alert, setAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState("idle");
  const [assignedAmbulance, setAssignedAmbulance] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [assigningDoctor, setAssigningDoctor] = useState(false);
  const [time, setTime] = useState(formatClock());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertData, ambulancesRes, doctorsRes] = await Promise.all([
        alertService.getAlertById(alertId),
        ambulanceService.list({ size: 100 }),
        doctorService.list({ size: 100 }),
      ]);
      setAlert(alertData);
      setAmbulances(ambulancesRes.content || []);
      setDoctors(doctorsRes.content || []);

      try {
        const interventionData = await interventionService.getByAlertId(alertId);
        setIntervention(interventionData);
      } catch {
        setIntervention(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger le détail de l'alerte.");
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
    const unsubAlerts = subscribe("/topic/alerts", () => loadData());
    const unsubInterventions = subscribe("/topic/interventions", () => loadData());
    return () => { unsubAlerts(); unsubInterventions(); };
  }, [connected, subscribe, loadData]);

  const availableAmbulances = ambulances.filter((a) => isAmbulanceAssignable(a.status));
  const availableDoctors = doctors.filter((d) => d.available);
  const assignedAmb = intervention?.ambulanceId
    ? ambulances.find((a) => a.id === intervention.ambulanceId)
    : null;
  const mapAmbulances = assignedAmb ? [assignedAmb] : availableAmbulances.slice(0, 5);

  const patientName = alert
    ? `${alert.citizenFirstName || ""} ${alert.citizenLastName || ""}`.trim() || "Citoyen"
    : "";
  const patientInitials = patientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  const patientMeta = [
    alert?.bloodGroup ? `Groupe ${alert.bloodGroup}` : null,
    alert?.citizenPhone || null,
  ].filter(Boolean).join(" · ");

  const handleAssign = async (amb) => {
    if (!alert || !intervention || !isAmbulanceAssignable(amb.status)) return;
    setAssignedAmbulance(amb.registrationNumber);
    setDispatchStatus("assigning");
    try {
      await validateAndAssignAmbulance(alert, intervention, amb.id);
      setDispatchStatus("success");
      toast.success(`Ambulance ${amb.registrationNumber} déployée.`);
      setTimeout(() => {
        navigate(`/medical-center/alerts/${alertId}/tracking`);
      }, 1200);
    } catch (err) {
      setDispatchStatus("idle");
      toast.error(err.response?.data?.message || "Échec de l'affectation.");
    }
  };

  const handleAssignDoctor = async () => {
    if (!intervention || !selectedDoctorId) return;
    setAssigningDoctor(true);
    try {
      const updated = await interventionService.updateStatus(intervention.id, {
        newStatus: "MEDECIN_ASSIGNE",
        doctorId: selectedDoctorId,
      });
      setIntervention(updated);
      const doc = doctors.find((d) => d.id === selectedDoctorId);
      toast.success(`Dr. ${doc?.userFirstName} ${doc?.userLastName} assigné à l'intervention.`);
      setSelectedDoctorId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de l'affectation du médecin.");
    } finally {
      setAssigningDoctor(false);
    }
  };

  if (loading) {
    return (
      <div className="alert-detail-app-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="alert-detail-app-wrapper container py-5">
        <div className="alert alert-danger">{error || "Alerte introuvable."}</div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/medical-center")}>
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const alertCode = formatAlertCode(alert.id);
  const alreadyAssigned = Boolean(intervention?.ambulanceRegistrationNumber);
  const readyForDoctor = intervention?.currentStatus === "ARRIVEE_AUX_URGENCES";
  const doctorAlreadyAssigned = Boolean(intervention?.doctorName);

  return (
    <div className="alert-detail-app-wrapper">
      <div className="detail-page-header">
        <div className="header-left-group">
          <button type="button" className="back-circle-btn" onClick={() => navigate("/medical-center")} aria-label="Retour">
            <BackArrowIcon />
          </button>
          <div className="header-title-section">
            <h1 className="alert-id-title">Alerte {alertCode}</h1>
            <span className="critical-priority-badge">• {priorityFullLabel(alert.priority)}</span>
          </div>
        </div>
        <div className="header-right-group">
          <span className="clock-pill">{time}</span>
        </div>
      </div>

      <div className="detail-page-content-grid">
        <div className="detail-left-column">
          <div className="detail-info-card card-patient">
            <div className="patient-card-header">
              <div className="patient-avatar-box">{patientInitials || "?"}</div>
              <div className="patient-text-info">
                <h2 className="patient-name">{patientName}</h2>
                <span className="patient-meta">{patientMeta || "Informations patient limitées"}</span>
              </div>
              {alert.citizenPhone && (
                <a href={`tel:${alert.citizenPhone}`} className="phone-call-btn" aria-label="Appeler le patient">
                  <PhoneIcon />
                </a>
              )}
            </div>
            <div className="patient-address-row">
              <div className="pin-icon-wrapper"><MapPinIcon /></div>
              <div className="address-text-group">
                <div className="address-line">{alert.address || "Adresse non renseignée"}</div>
                <div className="gps-line">{formatGpsCoordinates(alert.latitude, alert.longitude)}</div>
              </div>
            </div>
          </div>

          <div className="detail-info-card card-urgency-nature">
            <h3 className="card-section-label">Nature de l'urgence</h3>
            <div className="urgency-type-row">
              <div className="heart-icon-wrapper"><HeartIcon /></div>
              <span className="urgency-type-text">{alert.categoryName || "Urgence médicale"}</span>
            </div>
            {alert.description && (
              <div className="quote-description-box">{alert.description}</div>
            )}
          </div>

          <div className="detail-info-card card-map-mockup" style={{ padding: 0, overflow: "hidden", minHeight: "280px" }}>
            <RegulationMap alerts={[alert]} ambulances={mapAmbulances} tall />
          </div>

          <div className="mobile-action-button-container">
            <button
              type="button"
              className="action-assign-btn"
              onClick={() => navigate(`/medical-center/alerts/${alertId}/assign`)}
            >
              <AmbulanceIcon />
              <span>{alreadyAssigned ? "Réaffecter une ambulance" : "Affecter une ambulance"}</span>
            </button>
            {alreadyAssigned && (
              <button
                type="button"
                className="action-assign-btn mt-2"
                style={{ background: "var(--color-dashboard-blue, #0A55C4)" }}
                onClick={() => navigate(`/medical-center/alerts/${alertId}/tracking`)}
              >
                Suivre l'intervention
              </button>
            )}
          </div>
        </div>

        <div className="detail-right-column">
          <div className="assignment-panel-card">
            <h3 className="assignment-panel-title">
              {alreadyAssigned ? "Ambulance affectée" : "Sélectionner une ambulance à déployer"}
            </h3>

            {alreadyAssigned && dispatchStatus === "idle" && (
              <div className="amb-assignment-item" style={{ cursor: "default" }}>
                <div className="amb-item-left">
                  <div className="amb-avatar-box">🚑</div>
                  <div className="amb-info-text">
                    <span className="amb-name-label">{intervention.ambulanceRegistrationNumber}</span>
                    <span className="amb-distance-label">{intervention.medicalCenterName || "Centre médical"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="amb-deploy-action-btn"
                  onClick={() => navigate(`/medical-center/alerts/${alertId}/tracking`)}
                >
                  Suivre
                </button>
              </div>
            )}

            {!alreadyAssigned && dispatchStatus === "idle" && (
              <div className="amb-assignment-list">
                {availableAmbulances.length === 0 ? (
                  <p className="text-secondary small px-2">Aucune ambulance disponible pour le moment.</p>
                ) : (
                  availableAmbulances.map((amb) => (
                    <div key={amb.id} className="amb-assignment-item" onClick={() => handleAssign(amb)}>
                      <div className="amb-item-left">
                        <div className="amb-avatar-box">🚑</div>
                        <div className="amb-info-text">
                          <span className="amb-name-label">{amb.registrationNumber}</span>
                          <span className="amb-distance-label">
                            {amb.medicalCenterName || "Centre"} — {ambulanceStatusLabel(amb.status)}
                          </span>
                        </div>
                      </div>
                      <button type="button" className="amb-deploy-action-btn">Déployer</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {dispatchStatus === "assigning" && (
              <div className="assigning-state-overlay">
                <div className="spinner-loader" />
                <h4>Liaison radio établie...</h4>
                <p>Transmission de la fiche d'incident à {assignedAmbulance}</p>
              </div>
            )}

            {dispatchStatus === "success" && (
              <div className="assigning-state-overlay success">
                <div className="success-badge-circle">✓</div>
                <h4>Ambulance déployée</h4>
                <p>{assignedAmbulance} est en route vers la position GPS.</p>
              </div>
            )}
          </div>

          {readyForDoctor && (
            <div className="assignment-panel-card mt-3">
              <h3 className="assignment-panel-title">
                {doctorAlreadyAssigned ? "Médecin assigné" : "Assigner un médecin"}
              </h3>

              {doctorAlreadyAssigned ? (
                <div className="amb-assignment-item" style={{ cursor: "default" }}>
                  <div className="amb-item-left">
                    <div className="amb-avatar-box">🩺</div>
                    <div className="amb-info-text">
                      <span className="amb-name-label">{intervention.doctorName}</span>
                      <span className="amb-distance-label">Prise en charge médicale</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {availableDoctors.length === 0 ? (
                    <p className="text-secondary small px-2">Aucun médecin disponible pour le moment.</p>
                  ) : (
                    <>
                      <select
                        className="form-select form-select-sm mb-2"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        disabled={assigningDoctor}
                      >
                        <option value="">Choisir un médecin...</option>
                        {availableDoctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            Dr. {doc.userFirstName} {doc.userLastName} — {doc.specialty || "généraliste"}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="amb-deploy-action-btn w-100"
                        disabled={!selectedDoctorId || assigningDoctor}
                        onClick={handleAssignDoctor}
                      >
                        {assigningDoctor ? "Affectation..." : "Assigner ce médecin"}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}