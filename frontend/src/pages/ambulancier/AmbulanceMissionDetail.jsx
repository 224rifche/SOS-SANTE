import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { interventionService } from "../../services/interventionService";
import { alertService } from "../../services/alertService";
import { toast } from "react-toastify";
import "../../styles/ambulancier.css";

function getPriorityLabel(priority) {
  if (priority === 1) return "Critique";
  if (priority === 2) return "Haute";
  return "Standard";
}

export default function AmbulanceMissionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [intervention, setIntervention] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const interventionData = id
          ? await interventionService.getById(id)
          : await interventionService.getActiveIntervention();

        if (cancelled) return;

        if (!interventionData) {
          setError("Aucune mission trouvée.");
          return;
        }

        setIntervention(interventionData);

        if (interventionData.alertId) {
          const alert = await alertService.getAlertById(interventionData.alertId);
          if (!cancelled) setAlertData(alert);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError("Aucune mission trouvée.");
          } else {
            setError(err.response?.data?.message || "Impossible de charger les détails de la mission.");
            toast.error("Impossible de charger les détails de la mission.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetails();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="amb-detail-view-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div>Chargement des détails de la mission...</div>
      </div>
    );
  }

  if (error || !intervention) {
    return (
      <div className="amb-detail-view-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div>{error || "Aucune mission trouvée."}</div>
        <button type="button" onClick={() => navigate("/ambulancier")} className="amb-secondary-btn" style={{ marginTop: "16px" }}>
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const patientName = alertData
    ? `${alertData.citizenFirstName || ""} ${alertData.citizenLastName || ""}`.trim() || "Patient"
    : "Patient";

  const patientDetails = [
    alertData?.bloodGroup ? `Groupe ${alertData.bloodGroup}` : null,
    alertData?.citizenPhone || null,
  ].filter(Boolean).join(" · ") || "Informations patient non disponibles";

  const lat = alertData?.latitude != null ? Number(alertData.latitude).toFixed(4) : null;
  const lng = alertData?.longitude != null ? Math.abs(Number(alertData.longitude)).toFixed(4) : null;
  const coordsText = lat && lng ? `${lat}° N, ${lng}° O` : "";
  const locationDetails = [alertData?.address, coordsText].filter(Boolean).join(" — ") || "Lieu non renseigné";

  return (
    <div className="amb-detail-view-container">
      <div className="amb-detail-view-header">
        <button type="button" className="amb-back-circle-btn" onClick={() => navigate("/ambulancier")} aria-label="Retour">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="amb-mission-title-area">
          <h1 className="amb-mission-id-title">
            Mission #{String(intervention.id).substring(0, 7).toUpperCase()}
          </h1>
          <span className="amb-priority-tag-red">
            <span style={{ fontSize: "1.2rem" }}>●</span> {getPriorityLabel(alertData?.priority)}
          </span>
        </div>
      </div>

      <div className="amb-card-detail">
        <div className="amb-avatar-circle-green">
          {patientName.split(" ").map((n) => n.charAt(0)).join("").substring(0, 2).toUpperCase()}
        </div>
        <div className="amb-card-detail-info">
          <span className="amb-card-detail-title">{patientName}</span>
          <span className="amb-card-detail-subtitle">{patientDetails}</span>
        </div>
      </div>

      <div className="amb-card-detail">
        <div className="amb-location-icon-wrapper">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div className="amb-card-detail-info">
          <span className="amb-card-detail-title">
            {alertData?.address?.split(",")[0] || "Lieu de l'urgence"}
          </span>
          <span className="amb-card-detail-subtitle">{locationDetails}</span>
        </div>
      </div>

      <div className="amb-regulator-note-card">
        <div className="amb-note-header">
          <div className="amb-note-icon">i</div>
          <span>Note du régulateur</span>
        </div>
        <div className="amb-note-content">
          {alertData?.description || "Aucune note transmise par le centre de régulation."}
        </div>
      </div>

      {intervention.medicalCenterName && (
        <div className="amb-card-detail">
          <div className="amb-card-detail-info">
            <span className="amb-card-detail-title">Centre médical</span>
            <span className="amb-card-detail-subtitle">{intervention.medicalCenterName}</span>
          </div>
        </div>
      )}

      <div className="amb-bottom-action-container">
        <button type="button" className="amb-action-btn-green" onClick={() => navigate("/ambulancier/itineraire")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Démarrer la navigation
        </button>
      </div>
    </div>
  );
}
