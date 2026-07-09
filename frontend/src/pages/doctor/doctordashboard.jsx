import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { doctorService } from "../../services/doctorService";
import { interventionService } from "../../services/interventionService";
import { statusLabel } from "../medical-center/regulationUtils";

export default function DoctorDashboard() {
  const { connected, subscribe } = useWebSocket();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const [profile, setProfile] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    doctorService.getMyProfile()
      .then((data) => { setProfile(data); return interventionService.listMine(); })
      .then((list) => setInterventions(list || []))
      .catch(() => toast.error("Impossible de charger votre profil médecin."))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const upsertIntervention = useCallback((item) => {
    if (!profile?.id || item.doctorId !== profile.id) return;
    setInterventions((prev) => {
      const map = new Map(prev.map((i) => [i.id, i]));
      map.set(item.id, item);
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0)
      );
    });
  }, [profile?.id]);

  useEffect(() => {
    if (!connected || !profile?.id) return undefined;
    return subscribe("/topic/interventions", upsertIntervention);
  }, [connected, subscribe, profile?.id, upsertIntervention]);

  const toggleAvailability = async () => {
    if (!profile?.id) return;
    try {
      const updated = await doctorService.updateAvailability(profile.id, !profile.available);
      setProfile(updated);
      toast.success(updated.available ? "Vous êtes disponible." : "Vous êtes indisponible.");
    } catch {
      toast.error("Impossible de mettre à jour votre disponibilité.");
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-secondary">Chargement...</div>;
  }

  if (isAdmin) {
    return (
      <>
        <div className="alert alert-info mx-3 mt-3">
          <h5 className="alert-heading">Vue Administrateur</h5>
          <p className="mb-0">Le dashboard médecin n'est pas disponible en mode administrateur.</p>
          <p className="mb-0 small text-muted">Utilisez le Centre Médical pour gérer les interventions et les médecins.</p>
          <Link to="/medical-center/doctors" className="btn btn-sm btn-primary mt-2">
            Aller au Centre Médical
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="doc-layout-header" style={{ borderRadius: "0 0 20px 20px", margin: "-20px -16px 20px" }}>
        <div style={{ width: "100%" }}>
          <p className="mb-1 opacity-75 small">{profile?.medicalCenterName || "Centre médical"}</p>
          <h1 className="h4 fw-bold mb-3">
            Dr. {profile?.userFirstName} {profile?.userLastName}
          </h1>
          <div className="doc-stats-row">
            <div className="doc-stat-card">
              <div className="doc-stat-value">{interventions.length}</div>
              <div className="doc-stat-label">Interventions assignées</div>
            </div>
            <div className="doc-stat-card">
              <div className="doc-stat-value">{profile?.specialty?.slice(0, 8) || "—"}</div>
              <div className="doc-stat-label">Spécialité</div>
            </div>
            <div className="doc-stat-card">
              <div className="doc-stat-value">{profile?.available ? "Oui" : "Non"}</div>
              <div className="doc-stat-label">Disponible</div>
            </div>
          </div>
          <button type="button" className="doc-btn mt-2" onClick={toggleAvailability}>
            {profile?.available ? "Passer indisponible" : "Passer disponible"}
          </button>
        </div>
      </div>

      <h2 className="doc-page-title">Urgences assignées</h2>
      {!connected && (
        <p className="text-secondary small mb-3">Connexion temps réel en cours...</p>
      )}

      {interventions.length === 0 ? (
        <div className="doc-card text-center text-secondary py-4">
          <p className="mb-2">Aucune intervention assignée pour le moment.</p>
          <p className="small mb-0">Les nouvelles affectations apparaîtront ici en temps réel.</p>
        </div>
      ) : (
        interventions.map((item) => (
          <Link key={item.id} to={`/doctor/intervention/${item.id}`} className="doc-card doc-card-link">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <p className="fw-bold mb-1">
                  Intervention #{String(item.id).substring(0, 8).toUpperCase()}
                </p>
                <p className="small text-secondary mb-1">{item.medicalCenterName}</p>
                {item.ambulanceRegistrationNumber && (
                  <p className="small text-secondary mb-0">🚑 {item.ambulanceRegistrationNumber}</p>
                )}
              </div>
              <span className="doc-badge">{statusLabel(item.currentStatus)}</span>
            </div>
          </Link>
        ))
      )}
    </>
  );
}
