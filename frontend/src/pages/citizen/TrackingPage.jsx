import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { alertService } from "../../services/alertService";
import { interventionService } from "../../services/interventionService";
import { useWebSocket } from "../../contexts/WebSocketContext";

const STATUS_LABELS = {
  ALERTE_CREEE: "Alerte envoyée", EN_ATTENTE_VALIDATION: "En attente de validation",
  VALIDEE: "Validée", AMBULANCE_AFFECTEE: "Ambulance affectée", AMBULANCE_EN_ROUTE: "En route vers vous",
  ARRIVEE_SUR_LES_LIEUX: "Ambulance sur place", PATIENT_PRIS_EN_CHARGE: "Prise en charge",
  TRANSPORT_VERS_CENTRE: "Transport en cours", ARRIVEE_AUX_URGENCES: "Arrivée aux urgences",
};

const STATUS_ORDER = [
  "ALERTE_CREEE", "EN_ATTENTE_VALIDATION", "VALIDEE", "AMBULANCE_AFFECTEE",
  "AMBULANCE_EN_ROUTE", "ARRIVEE_SUR_LES_LIEUX", "PATIENT_PRIS_EN_CHARGE",
  "TRANSPORT_VERS_CENTRE", "ARRIVEE_AUX_URGENCES",
];

export default function TrackingPage() {
  const { alertId } = useParams();
  const { subscribe } = useWebSocket();
  const [alert, setAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const alertData = await alertService.getAlertById(alertId);
        if (cancelled) return;
        setAlert(alertData);
        try {
          const interventionData = await interventionService.getByAlertId(alertId);
          if (!cancelled) setIntervention(interventionData);
        } catch (interventionErr) {
          if (interventionErr.response?.status !== 403 && interventionErr.response?.status !== 404) throw interventionErr;
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Impossible de charger le suivi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [alertId]);

  useEffect(() => {
    if (!intervention?.id) return undefined;
    return subscribe(`/topic/interventions/${intervention.id}`, setIntervention);
  }, [intervention?.id, subscribe]);

  if (loading) return <div className="text-center py-5">Chargement du suivi...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const currentStatus = intervention?.currentStatus || alert?.status;
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <>
      <Link to="/citizen" className="cit-back-link">← Retour à l'accueil</Link>
      <h1 className="cit-page-title">Suivi de l'intervention</h1>
      <p className="cit-page-sub">{alert?.categoryName}</p>

      {intervention?.ambulanceRegistrationNumber && (
        <div className="cit-card mb-3">
          <p className="cit-card-title mb-1">Ambulance en route</p>
          <p className="cit-card-sub">Véhicule {intervention.ambulanceRegistrationNumber}</p>
        </div>
      )}

      <div className="cit-card">
        {STATUS_ORDER.map((status, index) => {
          const isDone = currentIndex >= 0 && index < currentIndex;
          const isActive = status === currentStatus;
          return (
            <div key={status} className="cit-tracking-step">
              <div className={`cit-tracking-dot ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                {isDone ? "✓" : isActive ? "●" : ""}
              </div>
              <div>
                <p className={`mb-0 small ${isActive ? "fw-bold" : "text-secondary"}`}>
                  {STATUS_LABELS[status] || status}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <a href="tel:15" className="cit-btn-primary d-block text-center text-decoration-none mt-3">
        Appeler le 15
      </a>
    </>
  );
}
