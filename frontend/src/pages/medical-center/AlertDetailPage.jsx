import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// SVG Icons
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: "#0A55C4" }}>
    <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.27 1.1l-2.18 2.11z" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#EF4444" }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#EF4444" }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const AmbulanceIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AlertDetailPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  
  const [showLabel, setShowLabel] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState("idle"); // idle | assigning | success
  const [assignedAmbulance, setAssignedAmbulance] = useState("");
  const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simuler les détails de l'alerte #NE-2481 de l'image
  const alertData = {
    id: "alert-1",
    code: "#NE-2481",
    patientName: "Awa Diallo",
    patientDetails: "F • 32 ans • Groupe O+",
    patientAvatar: "AD",
    address: "Quartier Hippodrome, Rue 224 porte 87",
    gps: "12.6392° N - 8.0029° O",
    urgencyTitle: "Malaise cardiaque",
    urgencyDescription: "« Homme, 58 ans, douleur thoracique intense et sueurs froides depuis 10 minutes. »",
    priority: "Priorité critique"
  };

  // Liste des ambulances de test pour le panel d'affectation
  const mockAmbulances = [
    { id: "amb-1", name: "Ambulance A1 - Donka", distance: "1.2 km (3 min)", status: "Disponible" },
    { id: "amb-2", name: "Ambulance A2 - Dixinn", distance: "2.5 km (6 min)", status: "Disponible" },
    { id: "amb-3", name: "Ambulance A3 - Kaloum", distance: "4.1 km (9 min)", status: "Disponible" }
  ];

  const handleAssign = (ambName) => {
    setAssignedAmbulance(ambName);
    setDispatchStatus("assigning");
    
    setTimeout(() => {
      setDispatchStatus("success");
      setTimeout(() => {
        setDispatchStatus("idle");
        navigate("/medical-center"); // Retourner au tableau de bord
      }, 1500);
    }, 1800);
  };

  return (
    <div className="alert-detail-app-wrapper">
      
      {/* HEADER DE LA PAGE (Plein Écran Desktop & Mobile) */}
      <div className="detail-page-header">
        <div className="header-left-group">
          <button 
            className="back-circle-btn" 
            onClick={() => navigate("/medical-center")}
            aria-label="Retour au tableau de bord"
          >
            <BackArrowIcon />
          </button>
          
          <div className="header-title-section">
            <h1 className="alert-id-title">Alerte {alertData.code}</h1>
            <span className="critical-priority-badge">• {alertData.priority}</span>
          </div>
        </div>

        <div className="header-right-group">
          <span className="clock-pill">{time}</span>
        </div>
      </div>

      {/* GRILLE PRINCIPALE (2 colonnes sur desktop, 1 colonne sur mobile) */}
      <div className="detail-page-content-grid">
        
        {/* COLONNE GAUCHE : Cartes d'informations */}
        <div className="detail-left-column">
          
          {/* CARTE PATIENT */}
          <div className="detail-info-card card-patient">
            <div className="patient-card-header">
              <div className="patient-avatar-box">
                {alertData.patientAvatar}
              </div>
              <div className="patient-text-info">
                <h2 className="patient-name">{alertData.patientName}</h2>
                <span className="patient-meta">{alertData.patientDetails}</span>
              </div>
              <button className="phone-call-btn" aria-label="Appeler le patient">
                <PhoneIcon />
              </button>
            </div>

            <div className="patient-address-row">
              <div className="pin-icon-wrapper">
                <MapPinIcon />
              </div>
              <div className="address-text-group">
                <div className="address-line">{alertData.address}</div>
                <div className="gps-line">{alertData.gps}</div>
              </div>
            </div>
          </div>

          {/* CARTE NATURE DE L'URGENCE */}
          <div className="detail-info-card card-urgency-nature">
            <h3 className="card-section-label">Nature de l'urgence</h3>
            
            <div className="urgency-type-row">
              <div className="heart-icon-wrapper">
                <HeartIcon />
              </div>
              <span className="urgency-type-text">{alertData.urgencyTitle}</span>
            </div>

            <div className="quote-description-box">
              {alertData.urgencyDescription}
            </div>
          </div>

          {/* CARTE CARTE DE POSITION GPS (Style Mockup Image) */}
          <div className="detail-info-card card-map-mockup">
            <div className="map-view-grid">
              <div className="map-horizontal-grid-line"></div>
              <div className="map-center-pulse-dot"></div>
            </div>
          </div>

          {/* BOUTON D'ACTION PRINCIPAL MOBILE (Affiché en bas à gauche de la colonne sur desktop, ou en bas fixe sur mobile) */}
          <div className="mobile-action-button-container">
            <button 
              className="action-assign-btn"
              onClick={() => navigate(`/medical-center/alerts/${alertId || 'alert-1'}/assign`)}
            >
              <AmbulanceIcon />
              <span>Affecter une ambulance</span>
            </button>
          </div>

        </div>

        {/* COLONNE DROITE : Panel d'affectation des secours (Desktop uniquement, caché ou tiroir sur mobile) */}
        <div className="detail-right-column">
          
          <div className="assignment-panel-card">
            <h3 className="assignment-panel-title">Sélectionner une ambulance à déployer</h3>
            
            {dispatchStatus === "idle" && (
              <div className="amb-assignment-list">
                {mockAmbulances.map((amb) => (
                  <div 
                    key={amb.id} 
                    className="amb-assignment-item"
                    onClick={() => handleAssign(amb.name)}
                  >
                    <div className="amb-item-left">
                      <div className="amb-avatar-box">🚑</div>
                      <div className="amb-info-text">
                        <span className="amb-name-label">{amb.name}</span>
                        <span className="amb-distance-label">{amb.distance}</span>
                      </div>
                    </div>
                    <button className="amb-deploy-action-btn">
                      Déployer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {dispatchStatus === "assigning" && (
              <div className="assigning-state-overlay">
                <div className="spinner-loader"></div>
                <h4>Liaison radio établie...</h4>
                <p>Transmission de la fiche d'incident à {assignedAmbulance}</p>
              </div>
            )}

            {dispatchStatus === "success" && (
              <div className="assigning-state-overlay success">
                <div className="success-badge-circle">✓</div>
                <h4>Ambulance Déployée !</h4>
                <p>{assignedAmbulance} est en route vers la position GPS.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Étiquette flottante "2 • Détail alerte" */}
      {showLabel && (
        <div className="floating-mockup-label shadow-premium">
          <span>2 • Détail alerte</span>
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
