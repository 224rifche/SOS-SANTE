import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { alertService } from "../../services/alertService";
import { interventionService } from "../../services/interventionService";

export default function AlertConfirmationPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const alertData = await alertService.getAlertById(alertId);
        if (!cancelled) setAlert(alertData);

        try {
          const interventionData = await interventionService.getByAlertId(alertId);
          if (!cancelled) setIntervention(interventionData);
        } catch {
          /* intervention may not exist yet */
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Impossible de charger les détails de l'alerte.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [alertId]);

  if (loading) {
    return (
      <div className="cit-page cit-page--center">
        <div className="cit-spinner" role="status" aria-label="Chargement" />
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="cit-page">
        <div className="cit-alert cit-alert--danger">{error || "Alerte introuvable."}</div>
        <button type="button" className="cit-btn cit-btn--secondary cit-btn--block" onClick={() => navigate("/citizen")}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const shortReference = `#NE-${alert.id.slice(0, 4).toUpperCase()}`;
  const statusLabel = alert.status === "EN_ATTENTE_VALIDATION"
    ? "En attente de validation"
    : alert.status;

  return (
    <div className="cit-page cit-confirm">
      <div className="cit-confirm-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045Z" />
        </svg>
      </div>

      <h1 className="cit-confirm-title">Alerte envoyée</h1>
      <p className="cit-confirm-sub">
        Les secours sont prévenus. Un régulateur traite votre demande.
      </p>

      <div className="cit-card cit-confirm-card">
        <div className="cit-confirm-row">
          <span>N° d'alerte</span>
          <strong className="cit-text-danger">{shortReference}</strong>
        </div>
        <div className="cit-confirm-row">
          <span>Régulateur</span>
          <strong>{intervention?.medicalCenterName || "En cours d'affectation"}</strong>
        </div>
        <div className="cit-confirm-row">
          <span>Statut</span>
          <strong>{statusLabel}</strong>
        </div>
      </div>

      <button
        type="button"
        className="cit-btn cit-btn--primary cit-btn--block cit-btn--lg"
        onClick={() => navigate(`/citizen/tracking/${alert.id}`)}
      >
        Suivre l'intervention
      </button>

      <a href="tel:15" className="cit-btn cit-btn--outline-danger cit-btn--block cit-btn--lg">
        Appeler le 15
      </a>
    </div>
  );
}
