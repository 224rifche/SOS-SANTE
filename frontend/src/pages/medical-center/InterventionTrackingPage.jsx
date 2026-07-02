import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// SVG Icons
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const AmbulanceIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "white" }}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const NavigationArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function InterventionTrackingPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();

  const [showLabel, setShowLabel] = useState(true);
  const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));
  const [currentStep, setCurrentStep] = useState(3); // Étape active par défaut : 3 (En route vers le patient)

  // Simulation d'avancement des étapes pour rendre la démo interactive
  const simulateNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(1); // Boucler pour le test
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const alertCode = "#NE-2481";
  const patientName = "Awa Diallo";
  const patientLocation = "Hippodrome";
  const assignedTeam = "Équipe NE-07";

  // Configuration des étapes correspondante au Stepper de l'image
  const timelineSteps = [
    {
      index: 1,
      title: "Alerte reçue & validée",
      time: "09:41",
      description: "Appel d'urgence qualifié et catégorisé par la régulation."
    },
    {
      index: 2,
      title: "Ambulance NE-07 affectée",
      time: "09:42",
      description: "Équipage mobilisé avec succès, en attente de départ."
    },
    {
      index: 3,
      title: "En route vers le patient",
      time: "Arrivée 09:48",
      description: "Le véhicule est en déplacement prioritaire avec gyrophares."
    },
    {
      index: 4,
      title: "Prise en charge",
      time: "En attente",
      description: "Premiers soins d'urgence prodigués sur site par l'équipage."
    },
    {
      index: 5,
      title: "Transport vers le CHU",
      time: "En attente",
      description: "Transfert sécurisé du patient vers le service des urgences du CHU Donka."
    }
  ];

  return (
    <div className="intervention-tracking-wrapper">
      
      {/* HEADER DE LA PAGE */}
      <div className="tracking-page-header">
        <div className="header-left-group">
          <button 
            className="back-circle-btn" 
            onClick={() => navigate("/medical-center")}
            aria-label="Retour au tableau de bord"
          >
            <BackArrowIcon />
          </button>
          <div className="header-title-section">
            <h1 className="tracking-title">Suivi {alertCode}</h1>
            <span className="live-pill">• Suivi en temps réel</span>
          </div>
        </div>
        <div className="header-right-group">
          <button className="control-btn" onClick={simulateNextStep}>
            ⚡ Étape suivante
          </button>
          <span className="clock-pill">{time}</span>
        </div>
      </div>

      {/* GRILLE DE CONTENU (2 colonnes sur desktop, 1 colonne sur mobile) */}
      <div className="tracking-page-content-grid">
        
        {/* COLONNE GAUCHE : Progression & Stepper */}
        <div className="tracking-left-column">
          
          {/* BANDEAU STATUT BLEU (De l'image) */}
          <div className="status-blue-banner">
            <div className="banner-left-info">
              <div className="banner-icon-bg">
                <AmbulanceIcon />
              </div>
              <div className="banner-text-block">
                <h2 className="banner-main-title">
                  {currentStep === 3 && `${assignedTeam} en route`}
                  {currentStep === 4 && `${assignedTeam} sur place`}
                  {currentStep === 5 && `${assignedTeam} transfert CHU`}
                  {currentStep < 3 && `${assignedTeam} affectée`}
                </h2>
                <span className="banner-sub-info">{patientName} • {patientLocation}</span>
              </div>
            </div>
            <div className="banner-right-eta">
              <span className="eta-big-num">
                {currentStep === 3 && "6"}
                {currentStep === 4 && "0"}
                {currentStep === 5 && "15"}
                {currentStep < 3 && "--"}
              </span>
              <span className="eta-unit-label">min</span>
            </div>
          </div>

          {/* SECTION PROGRESSION STEPPER */}
          <div className="tracking-stepper-card">
            <h3 className="stepper-section-title">Progression</h3>
            
            <div className="stepper-timeline-list">
              {timelineSteps.map((step) => {
                const isCompleted = step.index < currentStep;
                const isActive = step.index === currentStep;
                const isPending = step.index > currentStep;
                
                return (
                  <div key={step.index} className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                    {/* Icône du nœud */}
                    <div className="stepper-node-container">
                      {isCompleted && (
                        <div className="node-icon completed-node">
                          <CheckIcon />
                        </div>
                      )}
                      {isActive && (
                        <div className="node-icon active-node">
                          <NavigationArrowIcon />
                        </div>
                      )}
                      {isPending && (
                        <div className="node-icon pending-node"></div>
                      )}
                      {/* Ligne de connexion */}
                      {step.index < 5 && (
                        <div className={`node-connection-line ${step.index < currentStep ? "completed-line" : ""}`}></div>
                      )}
                    </div>

                    {/* Texte du nœud */}
                    <div className="stepper-text-container">
                      <div className="stepper-title-row">
                        <span className="step-title-txt">{step.title}</span>
                        <span className="step-time-txt">{step.time}</span>
                      </div>
                      <p className="step-desc-txt">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE : Grande Carte de suivi temps réel + Infos Équipage */}
        <div className="tracking-right-column">
          <div className="tracking-map-panel">
            <h3 className="map-panel-title">Position en direct des secours</h3>
            
            <div className="tracking-large-map-mock">
              <div className="map-grid-lines"></div>
              {/* Tracé de la route */}
              <svg className="live-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 15 85 L 35 55 L 60 50 L 85 20" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                {/* Tracé complété */}
                <path d="M 15 85 L 35 55 L 60 50" fill="none" stroke="var(--color-dashboard-blue)" strokeWidth="4" />
              </svg>
              {/* Point du patient */}
              <div className="map-live-marker-patient" style={{ left: "85%", top: "20%" }}>
                <span className="marker-label">Awa Diallo</span>📍
              </div>
              {/* Point de l'ambulance en mouvement */}
              <div className="map-live-marker-ambulance" style={{ left: "60%", top: "50%" }}>
                🚑<span className="pulse-circle"></span>
              </div>
            </div>

            <div className="crew-info-card">
              <span className="crew-label">Équipiers Mobiles</span>
              <div className="crew-member-item">
                <span className="crew-avatar">👨‍✈️</span>
                <div>
                  <div className="crew-name">Amadou Diallo</div>
                  <div className="crew-desc">Conducteur ambulancier • Radio: NE-07-A</div>
                </div>
              </div>
              <div className="crew-member-item">
                <span className="crew-avatar">👨‍⚕️</span>
                <div>
                  <div className="crew-name">Dr. Salif Keita</div>
                  <div className="crew-desc">Médecin urgentiste • Radio: NE-07-B</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Étiquette flottante "4 • Suivi intervention" */}
      {showLabel && (
        <div className="floating-mockup-label shadow-premium">
          <span>4 • Suivi intervention</span>
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
