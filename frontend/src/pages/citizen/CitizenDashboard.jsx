import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { citizenService } from "../../services/citizenService";
import { alertService } from "../../services/alertService";

const ACTIVE = new Set([
  "EN_ATTENTE_VALIDATION", "VALIDEE", "AMBULANCE_AFFECTEE", "AMBULANCE_EN_ROUTE",
  "ARRIVEE_SUR_LES_LIEUX", "PATIENT_PRIS_EN_CHARGE", "TRANSPORT_VERS_CENTRE", "ARRIVEE_AUX_URGENCES",
]);

const RESOLVED = new Set(["INTERVENTION_CLOTUREE", "ARCHIVEE"]);

const STATUS_LABELS = {
  ALERTE_CREEE: "Créée", EN_ATTENTE_VALIDATION: "En attente", VALIDEE: "Validée",
  REJETEE: "Rejetée", AMBULANCE_AFFECTEE: "Ambulance affectée", AMBULANCE_EN_ROUTE: "En route",
  ARRIVEE_SUR_LES_LIEUX: "Sur place", INTERVENTION_CLOTUREE: "Résolue", ARCHIVEE: "Archivée",
};

function getStatusBadgeClass(status) {
  if (ACTIVE.has(status)) return "bg-warning-subtle text-warning-emphasis";
  if (RESOLVED.has(status)) return "bg-success-subtle text-success-emphasis";
  return "bg-secondary-subtle text-secondary-emphasis";
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays} jours`;
}

export default function CitizenDashboard() {
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isAdmin = hasRole("ADMIN");

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
    Promise.all([citizenService.getMyProfile(), alertService.getMyAlerts()])
      .then(([p, a]) => { setProfile(p); setAlerts(a); })
      .catch((err) => setError(err.response?.data?.message || "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const activeAlert = alerts.find((a) => ACTIVE.has(a.status));
  const resolvedCount = alerts.filter((a) => RESOLVED.has(a.status)).length;
  const activeCount = alerts.filter((a) => ACTIVE.has(a.status)).length;
  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 18 ? "Bonjour" : "Bonsoir";
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  if (loading) {
    return <div className="text-center py-5 text-secondary">Chargement...</div>;
  }

  if (isAdmin) {
    return (
      <div className="text-center py-5">
        <p className="cit-section-label">Accès rapide</p>
        <div className="cit-grid-2">
          <div className="cit-card" style={{ opacity: 0.7 }}>
            <div className="cit-stat-icon blue">📍</div>
            <p className="cit-card-title">Ma position</p>
            <p className="cit-card-sub">Non disponible (admin)</p>
          </div>
          <div className="cit-card" style={{ opacity: 0.7 }}>
            <div className="cit-stat-icon red">📞</div>
            <p className="cit-card-title">Contact urgence</p>
            <p className="cit-card-sub">Non disponible (admin)</p>
          </div>
          <Link to="/citizen/history" className="cit-card cit-card-link">
            <div className="cit-stat-icon gray">📋</div>
            <p className="cit-card-title">Historique</p>
            <p className="cit-card-sub">Voir l'historique</p>
          </Link>
          <div className="cit-card" style={{ opacity: 0.7 }}>
            <div className="cit-stat-icon green">🩸</div>
            <p className="cit-card-title">Mon profil</p>
            <p className="cit-card-sub">Non disponible (admin)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <div className="alert alert-warning py-2 small">{error}</div>}

      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <p className="text-secondary text-capitalize small mb-0">{today}</p>
          <h1 className="h4 fw-bold mb-0">{greeting}, {user?.firstName || "Citoyen"}</h1>
        </div>
        <span className={`d-flex align-items-center gap-1 small ${isOnline ? "text-success" : "text-danger"}`}>
          <span
            className="rounded-circle d-inline-block"
            style={{ width: 8, height: 8, backgroundColor: "currentColor" }}
          />
          {isOnline ? "Connecté" : "Hors ligne"}
        </span>
      </div>

      <div className="row row-cols-3 g-2 mb-3">
        <div className="col">
          <div className="bg-light rounded-4 p-2 text-center h-100">
            <p className="fs-5 fw-bold mb-0">{alerts.length}</p>
            <p className="small text-secondary mb-0" style={{ fontSize: "0.7rem" }}>Total alertes</p>
          </div>
        </div>
        <div className="col">
          <div className="bg-warning-subtle rounded-4 p-2 text-center h-100">
            <p className="fs-5 fw-bold text-warning-emphasis mb-0">{activeCount}</p>
            <p className="small text-secondary mb-0" style={{ fontSize: "0.7rem" }}>En cours</p>
          </div>
        </div>
        <div className="col">
          <div className="bg-success-subtle rounded-4 p-2 text-center h-100">
            <p className="fs-5 fw-bold text-success-emphasis mb-0">{resolvedCount}</p>
            <p className="small text-secondary mb-0" style={{ fontSize: "0.7rem" }}>Résolues</p>
          </div>
        </div>
      </div>

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
        <Link to="/citizen/alert" className="cit-sos-btn-large cit-sos-pulse">
          <span>SOS</span>
          <span>URGENCE</span>
        </Link>
        <p className="cit-card-sub">Appuyez pour alerter les secours immédiatement</p>
      </div>

      <p className="cit-section-label">Accès rapide</p>
      <div className="cit-grid-2">
        <div className="cit-card shadow-sm cit-card-hover">
          <div className="cit-stat-icon blue">📍</div>
          <p className="cit-card-title">Ma position</p>
          <p className="cit-card-sub">{profile?.address || "Non renseignée"}</p>
        </div>
        <div className="cit-card shadow-sm cit-card-hover">
          <div className="cit-stat-icon red">📞</div>
          <p className="cit-card-title">Contact urgence</p>
          <p className="cit-card-sub">{profile?.emergencyContact || "À compléter"}</p>
        </div>
        <Link to="/citizen/history" className="cit-card cit-card-link shadow-sm cit-card-hover">
          <div className="cit-stat-icon gray">📋</div>
          <p className="cit-card-title">Historique</p>
          <p className="cit-card-sub">{alerts.length} alerte{alerts.length > 1 ? "s" : ""}</p>
        </Link>
        <Link to="/citizen/profile" className="cit-card cit-card-link shadow-sm cit-card-hover">
          <div className="cit-stat-icon green">🩸</div>
          <p className="cit-card-title">Mon profil</p>
          <p className="cit-card-sub">{profile?.bloodGroup ? `Groupe ${profile.bloodGroup}` : "À compléter"}</p>
        </Link>
      </div>

      {recentAlerts.length > 0 && (
        <>
          <p className="cit-section-label">Activité récente</p>
          <div className="list-group mb-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 fw-semibold small">{alert.categoryName}</p>
                  <p className="mb-0 text-secondary" style={{ fontSize: "0.75rem" }}>{timeAgo(alert.createdAt)}</p>
                </div>
                <span className={`badge rounded-pill ${getStatusBadgeClass(alert.status)}`}>
                  {STATUS_LABELS[alert.status] || alert.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {(!profile?.bloodGroup || !profile?.emergencyContact || !profile?.address) && (
        <div className="alert alert-info d-flex gap-2 align-items-start rounded-4">
          <span className="fs-5">💡</span>
          <div>
            <p className="fw-bold mb-1 small">Conseil</p>
            <p className="mb-0 small">
              Complétez votre <Link to="/citizen/profile">profil</Link> pour aider les secours à mieux vous assister.
            </p>
          </div>
        </div>
      )}

      <div className="cit-card mt-3" style={{ background: "#fff8f8", borderColor: "rgba(229,57,53,0.2)" }}>
        <p className="cit-card-title mb-1">Numéro d'urgence</p>
        <a href="tel:15" className="fw-bold text-danger text-decoration-none fs-4">15 — SAMU</a>
      </div>
    </>
  );
}