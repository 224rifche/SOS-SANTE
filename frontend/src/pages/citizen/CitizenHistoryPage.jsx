import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { alertService } from "../../services/alertService";

const STATUS_LABELS = {
  ALERTE_CREEE: "Créée", EN_ATTENTE_VALIDATION: "En attente", VALIDEE: "Validée",
  REJETEE: "Rejetée", AMBULANCE_AFFECTEE: "Ambulance affectée", AMBULANCE_EN_ROUTE: "En route",
  ARRIVEE_SUR_LES_LIEUX: "Sur place", INTERVENTION_CLOTUREE: "Clôturée", ARCHIVEE: "Archivée",
};

const ACTIVE = new Set(["EN_ATTENTE_VALIDATION", "VALIDEE", "AMBULANCE_AFFECTEE", "AMBULANCE_EN_ROUTE", "ARRIVEE_SUR_LES_LIEUX"]);

export default function CitizenHistoryPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertService.getMyAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5">Chargement...</div>;

  return (
    <>
      <h1 className="cit-page-title">Historique</h1>
      <p className="cit-page-sub">{alerts.length} alerte(s) enregistrée(s)</p>

      {alerts.length === 0 ? (
        <div className="cit-card text-center py-4">
          <p className="cit-card-sub mb-3">Aucune alerte pour le moment.</p>
          <Link to="/citizen/alert" className="cit-btn-primary d-inline-block text-decoration-none text-center" style={{ width: "auto", padding: "12px 24px" }}>
            Déclencher un SOS
          </Link>
        </div>
      ) : (
        alerts.map((alert) => (
          <div key={alert.id} className="cit-card mb-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <p className="cit-card-title">{alert.categoryName}</p>
                <p className="cit-card-sub">{new Date(alert.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <span className="badge bg-light text-dark border">{STATUS_LABELS[alert.status] || alert.status}</span>
            </div>
            {alert.address && <p className="cit-card-sub mb-2">{alert.address}</p>}
            {ACTIVE.has(alert.status) && (
              <Link to={`/citizen/tracking/${alert.id}`} className="btn btn-outline-danger btn-sm rounded-3 fw-semibold">
                Suivre l'intervention
              </Link>
            )}
          </div>
        ))
      )}
    </>
  );
}
