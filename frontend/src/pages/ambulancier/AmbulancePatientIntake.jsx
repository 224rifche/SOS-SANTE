import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { interventionService } from "../../services/interventionService";
import { toast } from "react-toastify";
import "../../styles/ambulancier.css";

export default function AmbulancePatientIntake() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  // Valeurs des constantes initialisées conformément à l'image
  const [heartRate, setHeartRate] = useState("112");
  const [bloodPressure, setBloodPressure] = useState("14/9");
  const [spo2, setSpo2] = useState("94");
  const [temperature, setTemperature] = useState("37,2");

  // État de conscience ("CONSCIENT", "SOMNOLENT", "INCONSCIENT")
  const [consciousness, setConsciousness] = useState("CONSCIENT");

  // Actes médicaux posés (Boolean)
  const [oxygenPlaced, setOxygenPlaced] = useState(true);
  const [ecgDone, setEcgDone] = useState(true);

  // Confirmer l'intake et démarrer le transport du patient
  const handleStartTransport = async () => {
    setLoading(true);
    const isDev = window.location.pathname.includes("/dev");
    
    try {
      if (isDev || !id || id.startsWith("mock")) {
        // Mode démo
        setTimeout(() => {
          toast.success("Constantes enregistrées. Départ vers le centre médical.");
          navigate(isDev ? "/dev/itineraire" : "/ambulancier/itineraire");
          setLoading(false);
        }, 800);
      } else {
        // Appeler le service réel pour passer à l'état TRANSPORT_VERS_CENTRE
        // Note : En production, les constantes vitales sont transmises dans le rapport
        await interventionService.updateStatus(id, {
          newStatus: "TRANSPORT_VERS_CENTRE"
        });
        toast.success("Patient pris en charge. Transport vers l'hôpital démarré.");
        navigate(`/ambulancier/itineraire`);
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la validation de la prise en charge.");
      setLoading(false);
    }
  };

  const isDevPath = window.location.pathname.includes("/dev");
  const backTarget = isDevPath ? "/dev/mission" : `/ambulancier/mission/${id || ""}`;

  return (
    <div className="amb-detail-view-container">
      {/* Header */}
      <div className="amb-detail-view-header">
        <button className="amb-back-circle-btn" onClick={() => navigate(backTarget)} aria-label="Retour">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#37474F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="amb-mission-title-area">
          <h1 className="amb-mission-id-title" style={{ fontSize: "1.35rem" }}>
            Prise en charge
          </h1>
        </div>
      </div>

      {/* Section Constantes vitales */}
      <span className="amb-section-subtitle-gray">Constantes vitales du patient</span>
      <div className="amb-vitals-grid">
        
        {/* Freq. Cardiaque */}
        <div className="amb-vital-card">
          <div className="amb-vital-header-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E53935">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Fréq. cardiaque</span>
          </div>
          <div className="amb-vital-value-row">
            <input 
              type="text" 
              className="amb-vital-input" 
              value={heartRate} 
              onChange={(e) => setHeartRate(e.target.value)}
            />
            <span className="amb-vital-unit">bpm</span>
          </div>
        </div>

        {/* Tension */}
        <div className="amb-vital-card">
          <div className="amb-vital-header-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>Tension</span>
          </div>
          <div className="amb-vital-value-row">
            <input 
              type="text" 
              className="amb-vital-input" 
              value={bloodPressure} 
              onChange={(e) => setBloodPressure(e.target.value)}
            />
            <span className="amb-vital-unit">cmHg</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="amb-vital-card">
          <div className="amb-vital-header-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#00ACC1">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            <span>SpO₂</span>
          </div>
          <div className="amb-vital-value-row">
            <input 
              type="text" 
              className="amb-vital-input" 
              value={spo2} 
              onChange={(e) => setSpo2(e.target.value)}
            />
            <span className="amb-vital-unit">%</span>
          </div>
        </div>

        {/* Température */}
        <div className="amb-vital-card">
          <div className="amb-vital-header-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FB8C00">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>
            <span>Température</span>
          </div>
          <div className="amb-vital-value-row">
            <input 
              type="text" 
              className="amb-vital-input" 
              value={temperature} 
              onChange={(e) => setTemperature(e.target.value)}
            />
            <span className="amb-vital-unit">°C</span>
          </div>
        </div>

      </div>

      {/* Section État de conscience */}
      <span className="amb-section-subtitle-gray">État de conscience</span>
      <div className="amb-pill-selector-row">
        <div 
          className={`amb-pill-select-btn ${consciousness === "CONSCIENT" ? "active" : ""}`}
          onClick={() => setConsciousness("CONSCIENT")}
        >
          Conscient
        </div>
        <div 
          className={`amb-pill-select-btn ${consciousness === "SOMNOLENT" ? "active" : ""}`}
          onClick={() => setConsciousness("SOMNOLENT")}
        >
          Somnolent
        </div>
        <div 
          className={`amb-pill-select-btn ${consciousness === "INCONSCIENT" ? "active" : ""}`}
          onClick={() => setConsciousness("INCONSCIENT")}
        >
          Inconscient
        </div>
      </div>

      {/* Capsules Actes Médicaux posés */}
      <div className="amb-procedure-row">
        
        {/* Oxygène posé */}
        <div 
          className={`amb-procedure-pill blue ${oxygenPlaced ? "active" : ""}`}
          onClick={() => setOxygenPlaced(!oxygenPlaced)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
          <span>Oxygène posé</span>
        </div>

        {/* ECG réalisé */}
        <div 
          className={`amb-procedure-pill green ${ecgDone ? "active" : ""}`}
          onClick={() => setEcgDone(!ecgDone)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            <path d="M12 5l-1.5 2h3z" />
          </svg>
          <span>ECG réalisé</span>
        </div>

      </div>

      {/* Bouton d'action au bas de l'écran */}
      <div className="amb-bottom-action-container">
        <button 
          className="amb-action-btn-green" 
          onClick={handleStartTransport}
          disabled={loading}
        >
          {/* Brancard / Stretcher SVG Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M3 6h18M3 10h18M6 10v6M18 10v6M10 10v6M14 10v6" />
            <path d="M5 6v4M19 6v4" />
          </svg>
          {loading ? "Traitement..." : "Transporter le patient"}
        </button>
      </div>
    </div>
  );
}
