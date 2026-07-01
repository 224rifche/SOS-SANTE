import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/ambulancier.css";

// Coordonnées pour l'itinéraire (Conakry/Bamako)
const routeCoordinates = [
  [9.5428, -13.6714], // Départ : CHU Donka
  [9.5450, -13.6690],
  [9.5482, -13.6665],
  [9.5515, -13.6640],
  [9.5540, -13.6628],
  [9.5562, -13.6622],
  [9.5580, -13.6620]  // Arrivée : Quartier Hippodrome (Rue 224, porte 87)
];

const navigationSteps = [
  { bannerTitle: "Dans 2.3 km", bannerSubtitle: "Départ de la base au CHU Donka" },
  { bannerTitle: "Dans 1.8 km", bannerSubtitle: "Prendre à droite sur la corniche Nord-Est" },
  { bannerTitle: "Dans 1.2 km", bannerSubtitle: "Continuer tout droit sur le Boulevard de l'Hôpital" },
  { bannerTitle: "Dans 400 m", bannerSubtitle: "Prendre à droite vers le carrefour Hippodrome" },
  { bannerTitle: "Dans 200 m", bannerSubtitle: "Tournez à droite - Rue 224" },
  { bannerTitle: "Vous êtes arrivé !", bannerSubtitle: "Destination à droite : Rue 224, porte 87" }
];

// Création d'icônes Leaflet personnalisées (DivIcon) pour éviter les problèmes d'import d'assets
const ambulanceIcon = L.divIcon({
  html: `
    <div style="background-color: #135431; color: white; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      </svg>
    </div>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const patientIcon = L.divIcon({
  html: `
    <div style="background-color: #E53935; color: white; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.12); box-shadow: 0 4px 16px rgba(229,57,53,0.5); }
        100% { transform: scale(1); }
      }
    </style>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function AmbulanceItinerary() {
  const navigate = useNavigate();
  const [currentPositionIdx, setCurrentPositionIdx] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [arrivalTimeStr, setArrivalTimeStr] = useState("09:48");
  const navigationInterval = useRef(null);

  // Générer une heure d'arrivée réaliste (+6 minutes par rapport à l'heure locale actuelle)
  useEffect(() => {
    const calculateETA = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 6);
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setArrivalTimeStr(`${hours}:${minutes}`);
    };
    calculateETA();
  }, []);

  // Démarrer ou mettre en pause le déplacement simulé
  const toggleNavigationSimulation = () => {
    if (isNavigating) {
      clearInterval(navigationInterval.current);
      setIsNavigating(false);
    } else {
      setIsNavigating(true);
      navigationInterval.current = setInterval(() => {
        setCurrentPositionIdx((prevIdx) => {
          if (prevIdx >= routeCoordinates.length - 1) {
            clearInterval(navigationInterval.current);
            setIsNavigating(false);
            toast.success("Vous êtes arrivé sur le lieu d'intervention !");
            return prevIdx;
          }
          return prevIdx + 1;
        });
      }, 2000); // Fait avancer toutes les 2 secondes
    }
  };

  useEffect(() => {
    return () => {
      if (navigationInterval.current) clearInterval(navigationInterval.current);
    };
  }, []);

  const currentAmbulancePos = routeCoordinates[currentPositionIdx];
  const patientPos = routeCoordinates[routeCoordinates.length - 1];

  // Calculer dynamiquement le titre et le sous-titre de la bannière GPS en fonction de la progression
  const currentStep = navigationSteps[Math.min(currentPositionIdx, navigationSteps.length - 1)];

  // Affichage spécifique calqué sur l'image : "Dans 200 m" / "Tournez à droite - Rue 224"
  // On simule ce virage spécifique vers l'étape finale de l'itinéraire
  const showTurnLeftMock = currentPositionIdx === 4 || currentPositionIdx === 5;
  const bannerTitle = showTurnLeftMock ? "Dans 200 m" : currentStep.bannerTitle;
  const bannerSubtitle = showTurnLeftMock ? "Tournez à droite - Rue 224" : currentStep.bannerSubtitle;

  return (
    <div className="amb-gps-container">
      {/* 1. Bannière de navigation haute (Flottante, verte) */}
      <div className="amb-gps-top-banner">
        <div className="amb-gps-banner-icon">
          {/* Icône de flèche pour tourner à droite */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 14 20 9 15 4" />
            <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
          </svg>
        </div>
        <div className="amb-gps-banner-info">
          <span className="amb-gps-banner-title">{bannerTitle}</span>
          <span className="amb-gps-banner-subtitle">{bannerSubtitle}</span>
        </div>
      </div>

      {/* Bouton de retour discret */}
      <button 
        className="amb-gps-back-btn" 
        onClick={() => navigate(window.location.pathname.startsWith("/dev") ? "/dev/mission" : "/ambulancier")}
        aria-label="Retour"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* 2. Carte Leaflet plein écran */}
      <div className="amb-gps-map-wrapper">
        <MapContainer 
          center={[9.550, -13.666]} 
          zoom={14} 
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Tracé vert de la route */}
          <Polyline 
            positions={routeCoordinates} 
            color="#135431" 
            weight={7} 
            opacity={0.8}
            dashArray="1, 8"
          />
          <Polyline 
            positions={routeCoordinates} 
            color="#2E7D32" 
            weight={5} 
            opacity={0.9}
          />

          {/* Marqueur de l'ambulance */}
          <Marker position={currentAmbulancePos} icon={ambulanceIcon} />

          {/* Marqueur du patient */}
          <Marker position={patientPos} icon={patientIcon} />
        </MapContainer>
      </div>

      {/* Bouton de simulation flottant discret */}
      <button 
        onClick={toggleNavigationSimulation}
        style={{
          position: "absolute",
          top: "140px",
          left: "20px",
          zIndex: 1000,
          backgroundColor: isNavigating ? "#ff8f00" : "#135431",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}
        title={isNavigating ? "Mettre en pause la simulation" : "Démarrer la simulation de trajet"}
      >
        {isNavigating ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* 3. Carte flottante de navigation basse (Blanche, arrondie) */}
      <div className="amb-gps-bottom-card">
        <div className="amb-gps-card-content">
          <div className="amb-gps-card-left">
            {/* Temps de trajet */}
            <span className="amb-gps-time-eta">
              {currentPositionIdx >= routeCoordinates.length - 1 ? "Arrivé" : "6 min"}
            </span>
            {/* Détails distance et arrivée */}
            <span className="amb-gps-distance-time">
              2,3 km • arrivée {arrivalTimeStr}
            </span>
          </div>

          {/* Bouton d'aide vocale (haut-parleur) */}
          <button 
            className="amb-gps-voice-btn"
            onClick={() => {
              setVoiceMuted(!voiceMuted);
              toast.info(voiceMuted ? "Guidage vocal activé" : "Guidage vocal désactivé");
            }}
            aria-label="Guidage vocal"
          >
            {voiceMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
