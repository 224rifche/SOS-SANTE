import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// SVG Icons
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const AmbulanceIcon = ({ selected }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: selected ? "#10B981" : "#64748B" }}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    {/* Petit symbole de croix de secours */}
    <line x1="8.5" y1="7" x2="8.5" y2="12" strokeWidth="1.5" />
    <line x1="6" y1="9.5" x2="11" y2="9.5" strokeWidth="1.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: "#10B981" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 11 11 13 15 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AmbulanceAssignmentPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();

  const [selectedAmbId, setSelectedAmbId] = useState("amb-1");
  const [showLabel, setShowLabel] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState("idle"); // idle | dispatching | success
  const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Liste des équipes/ambulances de test correspondantes à l'image
  const mockAmbulances = [
    {
      id: "amb-1",
      name: "Équipe NE-07",
      status: "Disponible",
      meta: "Disponible - 2 équipiers",
      distance: "2,3 km",
      eta: "6 min",
      type: "Type B (Réanimation)",
      staff: "Amadou Diallo (Chauffeur), Dr. Salif Keita (Médecin)",
      location: "Hamdallaye - Route Nationale"
    },
    {
      id: "amb-2",
      name: "Équipe NE-03",
      status: "Disponible",
      meta: "Disponible - 4,1 km - 11 min",
      distance: "4,1 km",
      eta: "11 min",
      type: "Type A (Secours d'urgence)",
      staff: "Modibo Touré (Chauffeur), Ousmane Sangaré (Secouriste)",
      location: "Dixinn - CHU Donka"
    },
    {
      id: "amb-3",
      name: "Équipe NE-12",
      status: "En intervention",
      meta: "En intervention",
      distance: "6,5 km",
      eta: "18 min",
      type: "Type B (Réanimation)",
      staff: "Jean Traoré (Chauffeur), Dr. Fatoumata Sow (Médecin)",
      location: "Hippodrome - En cours"
    }
  ];

  const selectedAmbulance = mockAmbulances.find(a => a.id === selectedAmbId);

  const handleConfirmAssignment = () => {
    if (!selectedAmbulance || selectedAmbulance.status === "En intervention") return;
    
    setDispatchStatus("dispatching");
    setTimeout(() => {
      setDispatchStatus("success");
      setTimeout(() => {
        setDispatchStatus("idle");
        navigate(`/medical-center/alerts/${alertId || 'alert-1'}/tracking`);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="ambulance-assignment-wrapper">
      
      {/* HEADER DE LA PAGE */}
      <div className="assignment-page-header">
        <div className="header-left-group">
          <button 
            className="back-circle-btn" 
            onClick={() => navigate(`/medical-center/alerts/${alertId || 'alert-1'}`)}
            aria-label="Retour au détail"
          >
            <BackArrowIcon />
          </button>
          <div className="header-title-section">
            <h1 className="assignment-title">Affecter une ambulance</h1>
            <span className="alert-meta-tag">Alerte #NE-2481</span>
          </div>
        </div>
        <div className="header-right-group">
          <span className="clock-pill">{time}</span>
        </div>
      </div>

      {/* GRILLE 2 COLONNES (Plein Écran Desktop) */}
      <div className="assignment-page-content-grid">
        
        {/* COLONNE GAUCHE : Liste des ambulances disponibles */}
        <div className="assignment-left-column">
          <span className="assignment-section-subtitle">Ambulances disponibles à proximité</span>
          
          <div className="ambulance-cards-list">
            {mockAmbulances.map((amb) => {
              const isSelected = amb.id === selectedAmbId;
              const isBusy = amb.status === "En intervention";
              
              return (
                <div 
                  key={amb.id}
                  className={`ambulance-selection-card ${isSelected ? "selected" : ""} ${isBusy ? "busy" : ""}`}
                  onClick={() => !isBusy && setSelectedAmbId(amb.id)}
                >
                  <div className="card-top-row">
                    <div className="amb-icon-wrapper">
                      <AmbulanceIcon selected={isSelected} />
                    </div>
                    <div className="amb-info-wrapper">
                      <h2 className="amb-name-title">{amb.name}</h2>
                      <span className={`amb-status-meta ${isBusy ? "busy-text" : ""}`}>{amb.meta}</span>
                    </div>
                    {isSelected && (
                      <div className="checkmark-box">
                        <CheckCircleIcon />
                      </div>
                    )}
                  </div>

                  {/* Affichage des métriques supplémentaires uniquement sur le modèle sélectionné (comme dans l'image) */}
                  {isSelected && (
                    <div className="card-bottom-metrics-row">
                      <div className="metric-box">
                        <span className="metric-val-bold">{amb.distance}</span>
                        <span className="metric-lbl-txt">Distance</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-val-bold green-txt">{amb.eta}</span>
                        <span className="metric-lbl-txt">ETA</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton d'action principal mobile */}
          <div className="mobile-action-button-container">
            <button 
              className="action-confirm-assign-btn"
              disabled={!selectedAmbulance || selectedAmbulance.status === "En intervention"}
              onClick={handleConfirmAssignment}
            >
              <span>Assigner {selectedAmbulance ? selectedAmbulance.name : "une équipe"}</span>
              <ArrowRightIcon />
            </button>
          </div>

        </div>

        {/* COLONNE DROITE : Détail de l'itinéraire & panel de confirmation (Desktop uniquement) */}
        <div className="assignment-right-column">
          <div className="route-detail-panel-card">
            <h3 className="route-panel-title">Détails de l'itinéraire de secours</h3>
            
            {dispatchStatus === "idle" && selectedAmbulance && (
              <div className="route-panel-body">
                {/* Carte d'itinéraire simulée */}
                <div className="routing-map-mockup">
                  <div className="map-grid-lines"></div>
                  {/* Tracé de l'itinéraire */}
                  <svg className="map-route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 20 80 Q 50 30, 80 20" fill="none" stroke="var(--color-urgency-success)" strokeWidth="4" strokeDasharray="6" />
                  </svg>
                  {/* Marqueur de départ (Ambulance) */}
                  <div className="map-marker-ambulance" style={{ left: "20%", top: "80%" }}>🚑</div>
                  {/* Marqueur d'arrivée (Patient) */}
                  <div className="map-marker-patient" style={{ left: "80%", top: "20%" }}>📍</div>
                </div>

                <div className="route-stats-summary">
                  <div className="route-stat-item">
                    <span className="route-stat-lbl">Point de départ</span>
                    <span className="route-stat-val">{selectedAmbulance.location}</span>
                  </div>
                  <div className="route-stat-item">
                    <span className="route-stat-lbl">Composition de l'équipe</span>
                    <span className="route-stat-val">{selectedAmbulance.staff}</span>
                  </div>
                  <div className="route-stat-item">
                    <span className="route-stat-lbl">Type de matériel</span>
                    <span className="route-stat-val">{selectedAmbulance.type}</span>
                  </div>
                </div>

                <button 
                  className="action-confirm-assign-btn desktop-only-btn"
                  onClick={handleConfirmAssignment}
                >
                  <span>Assigner {selectedAmbulance.name}</span>
                  <ArrowRightIcon />
                </button>
              </div>
            )}

            {dispatchStatus === "dispatching" && (
              <div className="assigning-state-overlay">
                <div className="spinner-loader"></div>
                <h4>Envoi de la feuille de mission...</h4>
                <p>Calcul de l'itinéraire optimal transmis en direct à l'équipage.</p>
              </div>
            )}

            {dispatchStatus === "success" && (
              <div className="assigning-state-overlay success">
                <div className="success-badge-circle">✓</div>
                <h4>Équipe mobilisée !</h4>
                <p>{selectedAmbulance.name} a démarré l'intervention. ETA : {selectedAmbulance.eta}.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Étiquette flottante "3 • Affectation" */}
      {showLabel && (
        <div className="floating-mockup-label shadow-premium">
          <span>3 • Affectation</span>
          <button 
            className="label-close"
            onClick={() => setShowLabel(false)}
            aria-label="Fermer"
          >
            <CloseIcon />
          </button>
        </div>
      )}

    </div>
  );
}
