import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { citizenService } from "../../services/citizenService";
import { alertService } from "../../services/alertService";

const ACTIVE = new Set([
  "EN_ATTENTE_VALIDATION", "VALIDEE", "AMBULANCE_AFFECTEE", "AMBULANCE_EN_ROUTE",
  "ARRIVEE_SUR_LES_LIEUX", "PATIENT_PRIS_EN_CHARGE", "TRANSPORT_VERS_CENTRE", "ARRIVEE_AUX_URGENCES",
]);

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([citizenService.getMyProfile(), alertService.getMyAlerts()])
      .then(([p, a]) => { setProfile(p); setAlerts(a); })
      .catch((err) => setError(err.response?.data?.message || "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  const activeAlert = alerts.find((a) => ACTIVE.has(a.status));

  if (loading) {
    return <div className="text-center py-5 text-secondary">Chargement...</div>;
  }

  return (
    <>
      {error && <div className="alert alert-warning py-2 small">{error}</div>}

      {activeAlert && (
        <div className="cit-alert-banner">
          <div>
            <p className="cit-card-title mb-1">Intervention en cours</p>
            <p className="cit-card-sub">{activeAlert.categoryName}</p>
          </div>
          <Link to={`/citizen/tracking/${activeAlert.id}`} className="btn btn-danger btn-sm rounded-3 fw-bold">
            Suivre
          </Link>
        </div>
      )}

      <div className="cit-sos-hero">
        <Link to="/citizen/alert" className="cit-sos-btn-large">
          <span>SOS</span>
          <span>URGENCE</span>
        </Link>
        <p className="cit-card-sub">Appuyez pour alerter les secours immédiatement</p>
      </div>

      <p className="cit-section-label">Accès rapide</p>
      <div className="cit-grid-2">
        <div className="cit-card">
          <div className="cit-stat-icon blue">📍</div>
          <p className="cit-card-title">Ma position</p>
          <p className="cit-card-sub">{profile?.address || "Non renseignée"}</p>
        </div>
        <div className="cit-card">
          <div className="cit-stat-icon red">📞</div>
          <p className="cit-card-title">Contact urgence</p>
          <p className="cit-card-sub">{profile?.emergencyContact || "À compléter"}</p>
        </div>
        <Link to="/citizen/history" className="cit-card cit-card-link">
          <div className="cit-stat-icon gray">📋</div>
          <p className="cit-card-title">Historique</p>
          <p className="cit-card-sub">{alerts.length} alerte{alerts.length > 1 ? "s" : ""}</p>
        </Link>
        <Link to="/citizen/profile" className="cit-card cit-card-link">
          <div className="cit-stat-icon green">🩸</div>
          <p className="cit-card-title">Mon profil</p>
          <p className="cit-card-sub">{profile?.bloodGroup ? `Groupe ${profile.bloodGroup}` : "À compléter"}</p>
        </Link>
      </div>

      <div className="cit-card mt-3" style={{ background: "#fff8f8", borderColor: "rgba(229,57,53,0.2)" }}>
        <p className="cit-card-title mb-1">Numéro d'urgence</p>
        <a href="tel:15" className="fw-bold text-danger text-decoration-none fs-4">15 — SAMU</a>
      </div>
    </>
  );
}
