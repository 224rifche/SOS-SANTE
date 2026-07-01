import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { interventionService } from "../../services/interventionService";
import { toast } from "react-toastify";
import "../../styles/ambulancier.css";

// Les étapes successives pour le statut de l'intervention gérées par l'ambulance
const STEPS = [
  { status: "AMBULANCE_AFFECTEE", label: "Ambulance affectée", desc: "L'ambulance a été assignée à la mission." },
  { status: "AMBULANCE_EN_ROUTE", label: "En route", desc: "L'équipe est en chemin vers le patient." },
  { status: "ARRIVEE_SUR_LES_LIEUX", label: "Arrivée sur place", desc: "L'équipage est sur les lieux de l'urgence." },
  { status: "PATIENT_PRIS_EN_CHARGE", label: "Patient pris en charge", desc: "Le patient est sous la responsabilité des ambulanciers." },
  { status: "TRANSPORT_VERS_CENTRE", label: "Transport en cours", desc: "Évacuation en cours vers l'hôpital." },
  { status: "ARRIVEE_AUX_URGENCES", label: "Arrivé aux urgences", desc: "Patient remis au service d'accueil des urgences." }
];

export default function AmbulancierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribe, connected } = useWebSocket();

  const [available, setAvailable] = useState(true);
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isMocked, setIsMocked] = useState(false);

  // Charger l'intervention active
  const fetchActiveIntervention = async () => {
    setLoading(true);
    try {
      const data = await interventionService.getActiveIntervention();
      if (data) {
        setActiveIntervention(data);
        setIsMocked(false);
      } else {
        loadMockIntervention();
      }
    } catch (err) {
      console.warn("Impossible de récupérer l'intervention active du serveur, chargement du mockup de démonstration...", err);
      loadMockIntervention();
    } finally {
      setLoading(false);
    }
  };

  const loadMockIntervention = () => {
    // Mode démo / mockup conforme au visuel demandé
    setActiveIntervention({
      id: "mock-12345",
      currentStatus: "AMBULANCE_AFFECTEE",
      alert: {
        id: "alert-mock",
        category: { name: "Malaise cardiaque" },
        priority: 1, // Critique
        location: {
          address: "Quartier Hippodrome, Rue 224 porte 87"
        }
      },
      durationText: "6 min",
      distanceText: "2,3 km",
      upcoming: {
        category: "Transfert programmé",
        location: "CHU Gabriel Touré - 11:30"
      }
    });
    setIsMocked(true);
  };

  useEffect(() => {
    fetchActiveIntervention();
  }, []);

  // S'abonner aux mises à jour via WebSocket
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe("/topic/interventions", (updatedIntervention) => {
      // Si la mise à jour concerne notre centre médical ou notre ambulance
      if (
        activeIntervention &&
        updatedIntervention.id === activeIntervention.id
      ) {
        setActiveIntervention(updatedIntervention);
        toast.info(`Statut de la mission mis à jour : ${updatedIntervention.currentStatus}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [connected, subscribe, activeIntervention]);

  // Obtenir le libellé de la priorité
  const getPriorityLabel = (priority) => {
    if (priority === 1 || priority === "CRITICAL") return "Priorité critique";
    if (priority === 2 || priority === "HIGH") return "Priorité haute";
    return "Priorité standard";
  };

  // Obtenir le nom d'équipe et matricule de l'ambulancier connecté
  const getTeamName = () => {
    if (!user) return "Équipe NE-07 - Moussa T.";
    const firstName = user.firstName || "Moussa";
    const lastNameLetter = user.lastName ? user.lastName.charAt(0) + "." : "T.";
    return `Équipe NE-07 - ${firstName} ${lastNameLetter}`;
  };

  // Gérer la transition de statut
  const handleNextStatus = async () => {
    if (!activeIntervention) return;

    // Trouver l'étape suivante dans le tableau STEPS
    const currentIndex = STEPS.findIndex(s => s.status === activeIntervention.currentStatus);
    if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
      toast.warning("La mission a déjà atteint sa dernière phase d'acheminement.");
      return;
    }

    const nextStep = STEPS[currentIndex + 1];
    if (nextStep.status === "PATIENT_PRIS_EN_CHARGE") {
      setShowDetailModal(false);
      navigate(isMocked ? "/dev/prise-en-charge" : `/ambulancier/mission/${activeIntervention.id}/prise-en-charge`);
      return;
    }

    setUpdating(true);
    try {
      if (isMocked) {
        // En mode démo, on simule localement
        setTimeout(() => {
          setActiveIntervention(prev => ({
            ...prev,
            currentStatus: nextStep.status
          }));
          toast.success(`Statut modifié : ${nextStep.label}`);
          setUpdating(false);
        }, 600);
      } else {
        // En mode réel, on appelle l'API backend
        const updated = await interventionService.updateStatus(activeIntervention.id, {
          newStatus: nextStep.status
        });
        setActiveIntervention(updated);
        toast.success(`Mission mise à jour : ${nextStep.label}`);
        setUpdating(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
      setUpdating(false);
    }
  };

  // Trouver l'index de l'étape active dans le processus
  const activeIndex = activeIntervention 
    ? STEPS.findIndex(s => s.status === activeIntervention.currentStatus)
    : 0;

  return (
    <div className="ambulancier-container">
      {/* En-tête vert foncé conforme à l'image */}
      <header className="amb-header">
        <div className="amb-header-top">
          <div className="amb-team-info">
            <div className="amb-icon-wrapper">
              {/* Icône d'ambulance blanche */}
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

          {/* Badge de disponibilité clicable */}
          <div 
            className="amb-status-badge"
            onClick={() => {
              setAvailable(!available);
              toast.success(available ? "Vous êtes maintenant hors service." : "Vous êtes en service.");
            }}
          >
            <span className={`amb-status-dot ${available ? "" : "off-duty"}`}></span>
            <span>{available ? "En service" : "Hors service"}</span>
          </div>
        </div>
      </header>

      {/* Zone de contenu principale */}
      <main className="amb-content">
        {/* Titre Mission Active */}
        <h2 className="amb-section-title">
          <span style={{ color: "#E53935", marginRight: "4px" }}>●</span> MISSION ACTIVE
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>Chargement de l'intervention...</div>
        ) : activeIntervention ? (
          <>
            {/* Carte de la Mission Active */}
            <div className="amb-card" onClick={() => navigate(`/ambulancier/mission/${activeIntervention.id}`)}>
              <div className="amb-card-header">
                <div className="amb-card-left">
                  <div className="amb-card-icon critical">
                    {/* Icône cœur avec battement */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <div className="amb-card-info">
                    <span className="amb-card-title">{activeIntervention.alert?.category?.name || "Urgence"}</span>
                    <span className="amb-card-subtitle">
                      #{activeIntervention.id ? activeIntervention.id.substring(0, 7).toUpperCase() : "NE-2481"} - {getPriorityLabel(activeIntervention.alert?.priority)}
                    </span>
                  </div>
                </div>
                <div className="amb-card-chevron">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Lieu */}
              <div className="amb-card-location">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{activeIntervention.alert?.location?.address || "Lieu non renseigné"}</span>
              </div>

              {/* Statistiques Trajet */}
              <div className="amb-card-stats">
                <div className="amb-stat-box green" onClick={(e) => { e.stopPropagation(); navigate("/ambulancier/itineraire"); }}>
                  <span className="amb-stat-value">{activeIntervention.durationText || "6 min"}</span>
                  <span className="amb-stat-label">Temps trajet</span>
                </div>
                <div className="amb-stat-box gray" onClick={(e) => { e.stopPropagation(); navigate("/ambulancier/itineraire"); }}>
                  <span className="amb-stat-value">{activeIntervention.distanceText || "2,3 km"}</span>
                  <span className="amb-stat-label">Distance</span>
                </div>
              </div>

              {/* Bouton itinéraire */}
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
                  transition: "all 0.2s"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/ambulancier/itineraire");
                }}
                className="amb-itinerary-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="18" x2="9" y2="3" />
                  <line x1="15" y1="21" x2="15" y2="6" />
                </svg>
                Voir l'itinéraire sur la carte
              </div>
            </div>

            {/* Titre A Venir */}
            <h2 className="amb-section-title upcoming">À venir</h2>

            {/* Carte A Venir */}
            <div className="amb-upcoming-card">
              <div className="amb-card-icon scheduled">
                {/* Icône Calendrier */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="amb-card-info">
                <span className="amb-card-title" style={{ fontSize: "1rem" }}>
                  {activeIntervention.upcoming?.category || "Transfert programmé"}
                </span>
                <span className="amb-card-subtitle">
                  {activeIntervention.upcoming?.location || "CHU Gabriel Touré - 11:30"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="amb-card" style={{ padding: "30px", textAlign: "center", color: "#90A4AE" }}>
            Aucune mission active assignée pour le moment.
          </div>
        )}
      </main>

      {/* Barre de navigation du bas calquée sur le visuel */}
      <nav className="amb-bottom-nav">
        <button className="amb-nav-item active">
          {/* Icône Presse-papiers / Missions */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
        </button>
        <span className="amb-nav-center-text">1 • Mes missions</span>
        <button className="amb-nav-item" onClick={() => fetchActiveIntervention()}>
          {/* Icône de rafraîchissement */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>
      </nav>

      {/* Modal Détails Mission & Workflow */}
      {showDetailModal && activeIntervention && (
        <div className="amb-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="amb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="amb-modal-header">
              <span className="amb-modal-title">Suivi de l'intervention</span>
              <button className="amb-close-btn" onClick={() => setShowDetailModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Urgence</div>
              <div className="amb-detail-value">{activeIntervention.alert?.category?.name || "Urgence médicale"}</div>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Lieu de prise en charge</div>
              <div className="amb-detail-value">{activeIntervention.alert?.location?.address || "Lieu inconnu"}</div>
            </div>

            <div className="amb-detail-section">
              <div className="amb-detail-subtitle">Description</div>
              <div className="amb-detail-value" style={{ fontWeight: "normal", fontSize: "0.95rem" }}>
                {activeIntervention.alert?.description || "Aucune description fournie."}
              </div>
            </div>

            {/* Timeline du Workflow de l'Ambulance */}
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

            {/* Panel d'action de changement de statut */}
            <div className="amb-action-panel">
              {activeIndex < STEPS.length - 1 ? (
                <button 
                  className="amb-primary-btn" 
                  onClick={handleNextStatus} 
                  disabled={updating}
                >
                  {updating ? (
                    "Mise à jour..."
                  ) : (
                    <>
                      <span>Passer à l'étape suivante : </span>
                      <strong>{STEPS[activeIndex + 1].label}</strong>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  className="amb-primary-btn success" 
                  onClick={() => setShowDetailModal(false)}
                >
                  Mission terminée et transmise
                </button>
              )}
              {isMocked && (
                <div style={{ fontSize: "0.8rem", color: "#FF8F00", textAlign: "center", fontStyle: "italic" }}>
                  * Mode Démo : Les transitions sont simulées localement.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
