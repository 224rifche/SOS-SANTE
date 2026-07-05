import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { interventionService } from "../../services/interventionService";
import { alertService } from "../../services/alertService";
import { ambulancierService } from "../../services/ambulancierService";
import { toast } from "react-toastify";
import "../../styles/ambulancier.css";

const STEPS = [
  { status: "AMBULANCE_AFFECTEE", label: "Ambulance affectée", desc: "L'ambulance a été assignée à la mission." },
  { status: "AMBULANCE_EN_ROUTE", label: "En route", desc: "L'équipe est en chemin vers le patient." },
  { status: "ARRIVEE_SUR_LES_LIEUX", label: "Arrivée sur place", desc: "L'équipage est sur les lieux de l'urgence." },
  { status: "PATIENT_PRIS_EN_CHARGE", label: "Patient pris en charge", desc: "Le patient est sous la responsabilité des ambulanciers." },
  { status: "TRANSPORT_VERS_CENTRE", label: "Transport en cours", desc: "Évacuation en cours vers l'hôpital." },
  { status: "ARRIVEE_AUX_URGENCES", label: "Arrivé aux urgences", desc: "Patient remis au service d'accueil des urgences." },
];

export default function AmbulancierDashboard() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { subscribe, connected } = useWebSocket();
  const isAdmin = hasRole("ADMIN");

  const [profile, setProfile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const loadMissionData = useCallback(async () => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const intervention = await interventionService.getActiveIntervention();
      if (!intervention) {
        setActiveIntervention(null);
        setAlertData(null);
        return;
      }
      setActiveIntervention(intervention);
      if (intervention.alertId) {
        const alert = await alertService.getAlertById(intervention.alertId);
        setAlertData(alert);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setActiveIntervention(null);
        setAlertData(null);
      } else {
        setFetchError(err.response?.data?.message || "Impossible de charger votre mission active.");
        toast.error("Impossible de charger votre mission active.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    ambulancierService.getMyProfile()
      .then((data) => {
        setProfile(data);
        setAvailable(data.available ?? true);
      })
      .catch(() => {});
    loadMissionData();
  }, [loadMissionData, isAdmin]);

  useEffect(() => {
    if (!connected || !activeIntervention?.id) return undefined;

    const unsubscribe = subscribe("/topic/interventions", (updatedIntervention) => {
      if (updatedIntervention.id === activeIntervention.id) {
        setActiveIntervention(updatedIntervention);
        toast.info(`Statut mis à jour : ${updatedIntervention.currentStatus}`);
      }
    });

    return unsubscribe;
  }, [connected, subscribe, activeIntervention?.id]);

  const getPriorityLabel = (priority) => {
    if (priority === 1) return "Priorité critique";
    if (priority === 2) return "Priorité haute";
    return "Priorité standard";
  };

  const getTeamName = () => {
    if (profile?.matricule) {
      return `Équipe ${profile.matricule} — ${profile.userFirstName || ""} ${profile.userLastName?.charAt(0) || ""}.`.trim();
    }
    if (!user) return "Équipe ambulancier";
    const lastInitial = user.lastName ? `${user.lastName.charAt(0)}.` : "";
    return `Équipe — ${user.firstName || ""} ${lastInitial}`.trim();
  };

  const handleToggleAvailability = async () => {
    if (!profile?.id || togglingAvailability) return;
    setTogglingAvailability(true);
    const nextAvailable = !available;
    try {
      const updated = await ambulancierService.updateAvailability(profile.id, nextAvailable);
      setAvailable(updated.available);
      setProfile(updated);
      toast.success(nextAvailable ? "Vous êtes en service." : "Vous êtes hors service.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de mettre à jour votre disponibilité.");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleNextStatus = async () => {
    if (!activeIntervention) return;

    const currentIndex = STEPS.findIndex((s) => s.status === activeIntervention.currentStatus);
    if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
      toast.warning("La mission a déjà atteint sa dernière phase d'acheminement.");
      return;
    }

    const nextStep = STEPS[currentIndex + 1];
    if (nextStep.status === "PATIENT_PRIS_EN_CHARGE") {
      setShowDetailModal(false);
      navigate(`/ambulancier/mission/${activeIntervention.id}/prise-en-charge`);
      return;
    }

    setUpdating(true);
    try {
      const updated = await interventionService.updateStatus(activeIntervention.id, {
        newStatus: nextStep.status,
      });
      setActiveIntervention(updated);
      toast.success(`Mission mise à jour : ${nextStep.label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdating(false);
    }
  };

  const activeIndex = activeIntervention
    ? STEPS.findIndex((s) => s.status === activeIntervention.currentStatus)
    : -1;

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px 0" }}>Chargement de l'intervention...</div>;
  }

  if (isAdmin) {
    return (
      <div className="ambulancier-container">
        <div className="alert alert-info mx-3 mt-3">
          <h5 className="alert-heading">Vue Administrateur</h5>
          <p className="mb-0">Le dashboard ambulancier n'est pas disponible en mode administrateur.</p>
          <p className="mb-0 small text-muted">Utilisez le Centre Médical pour gérer les interventions et ambulances.</p>
          <Link to="/medical-center" className="btn btn-sm btn-primary mt-2">
            Aller au Centre Médical
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ambulancier-container">
      <header className="amb-header">
        <div className="amb-header-top">
          <div className="amb-team-info">
            <div className="amb-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="amb-team-text">
              <span className="amb-team-label">Équipe</span>
              <span className="amb-team-name">{getTeamName()}</span>
            </div>
          </div>

          <button
            type="button"
            className="amb-status-badge border-0"
            onClick={handleToggleAvailability}
            disabled={!profile?.id || togglingAvailability}
          >
            <span className={`amb-status-dot ${available ? "" : "off-duty"}`} />
            <span>{available ? "En service" : "Hors service"}</span>
          </button>
        </div>
      </header>

      <main className="amb-content">
        <h2 className="amb-section-title">
          <span style={{ color: "#E53935", marginRight: "4px" }}>●</span> MISSION ACTIVE
        </h2>

        {fetchError ? (
          <div className="amb-card" style={{ padding: "30px", textAlign: "center", color: "#c62828" }}>
            <p className="mb-3">{fetchError}</p>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={loadMissionData}>
              Réessayer
            </button>
          </div>
        ) : activeIntervention ? (
          <>
            <div className="amb-card" onClick={() => navigate(`/ambulancier/mission/${activeIntervention.id}`)}>
              <div className="amb-card-header">
                <div className="amb-card-left">
                  <div className="amb-card-icon critical">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div className="amb-card-info">
                    <span className="amb-card-title">{alertData?.categoryName || "Urgence"}</span>
                    <span className="amb-card-subtitle">
                      #{String(activeIntervention.id).substring(0, 7).toUpperCase()} — {getPriorityLabel(alertData?.priority)}
                    </span>
                  </div>
                </div>
                <div className="amb-card-chevron">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              <div className="amb-card-location">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{alertData?.address || "Lieu non renseigné"}</span>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "#135431",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  padding: "10px",
                  borderRadius: "12px",
                  backgroundColor: "#E8F5E9",
                  border: "1px dashed rgba(19, 84, 49, 0.3)",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/ambulancier/itineraire");
                }}
                className="amb-itinerary-btn"
              >
                Voir l'itinéraire sur la carte
              </div>
            </div>

            <button
              type="button"
              className="amb-primary-btn w-100 mt-3"
              onClick={() => setShowDetailModal(true)}
            >
              Suivre la progression de la mission
            </button>
          </>
        ) : (
          <div className="amb-card" style={{ padding: "30px", textAlign: "center", color: "#90A4AE" }}>
            Aucune mission active assignée pour le moment.
          </div>
        )}
      </main>

      {showDetailModal && activeIntervention && (
        <div className="amb-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="amb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="amb-modal-header">
              <span className="amb-modal-title">Suivi de l'intervention</span>
              <button type="button" className="amb-close-btn" onClick={() => setShowDetailModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Urgence</div>
              <div className="amb-detail-value">{alertData?.categoryName || "Urgence médicale"}</div>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Lieu de prise en charge</div>
              <div className="amb-detail-value">{alertData?.address || "Lieu inconnu"}</div>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Description</div>
              <div className="amb-detail-value" style={{ fontWeight: "normal", fontSize: "0.95rem" }}>
                {alertData?.description || "Aucune description fournie."}
              </div>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Progression de la mission</div>
              <div className="amb-timeline">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx < activeIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={step.status}
                      className={`amb-timeline-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                    >
                      <div className="amb-timeline-node">
                        {isCompleted && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="amb-timeline-content">
                        <span className="amb-timeline-title">{step.label}</span>
                        <span className="amb-timeline-desc">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="amb-action-panel">
              {activeIndex < STEPS.length - 1 ? (
                <button type="button" className="amb-primary-btn" onClick={handleNextStatus} disabled={updating}>
                  {updating ? "Mise à jour..." : (
                    <>
                      <span>Passer à l'étape suivante : </span>
                      <strong>{STEPS[activeIndex + 1].label}</strong>
                    </>
                  )}
                </button>
              ) : (
                <button type="button" className="amb-primary-btn success" onClick={() => setShowDetailModal(false)}>
                  Mission terminée et transmise
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
