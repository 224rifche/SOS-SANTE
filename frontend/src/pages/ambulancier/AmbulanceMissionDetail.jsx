import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { interventionService } from "../../services/interventionService";
import { toast } from "react-toastify";
import "../../styles/ambulancier.css";

export default function AmbulanceMissionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [intervention, setIntervention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMocked, setIsMocked] = useState(false);

  useEffect(() => {
    const fetchInterventionDetails = async () => {
      setLoading(true);
      try {
        const data = await interventionService.getActiveIntervention();
        if (data && (data.id === id || !id)) {
          setIntervention(data);
          setIsMocked(false);
        } else {
          loadMockDetails();
        }
      } catch (err) {
        console.warn("Erreur lors de la récupération des détails réels, chargement des données de simulation...", err);
        loadMockDetails();
      } finally {
        setLoading(false);
      }
    };

    fetchInterventionDetails();
  }, [id]);

  const loadMockDetails = () => {
    setIntervention({
      id: id || "mock-12345",
      currentStatus: "AMBULANCE_AFFECTEE",
      alert: {
        id: "alert-mock",
        categoryName: "Malaise cardiaque",
        priority: 1, // Critique
        description: "Douleur thoracique intense, sueurs froides. Préparer oxygène + ECG. Patient conscient.",
        latitude: 12.6392,
        longitude: 8.0029,
        location: {
          address: "Quartier Hippodrome, Rue 224, porte 87"
        }
      },
      patient: {
        name: "Awa Diallo",
        gender: "F",
        age: 32,
        bloodGroup: "O+",
        allergies: "Allergie pénicilline"
      }
    });
    setIsMocked(true);
  };

  if (loading) {
    return (
      <div className="amb-detail-view-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div>Chargement des détails de la mission...</div>
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="amb-detail-view-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div>Aucune mission trouvée.</div>
        <button onClick={() => navigate("/ambulancier")} className="amb-secondary-btn" style={{ marginTop: "16px" }}>
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  // Obtenir les détails du patient (réels ou simulés)
  const patientName = intervention.patient?.name || "Awa Diallo";
  const patientDetails = intervention.patient 
    ? `${intervention.patient.gender} - ${intervention.patient.age} ans - ${intervention.patient.bloodGroup} - ${intervention.patient.allergies}`
    : "F - 32 ans - O+ - Allergie pénicilline";

  // Obtenir la note du régulateur (description de l'alerte)
  const regulatorNote = intervention.alert?.description || "Douleur thoracique intense, sueurs froides. Préparer oxygène + ECG. Patient conscient.";

  // Obtenir les coordonnées géographiques
  const lat = intervention.alert?.latitude ? intervention.alert.latitude.toFixed(4) : "12.6392";
  const lng = intervention.alert?.longitude ? Math.abs(intervention.alert.longitude).toFixed(4) : "8.0029";
  const locationDetails = `${intervention.alert?.location?.address || "Quartier Hippodrome, Rue 224, porte 87"} - ${lat}° N, ${lng}° O`;

  return (
    <div className="amb-detail-view-container">
      {/* Header */}
      <div className="amb-detail-view-header">
        <button className="amb-back-circle-btn" onClick={() => navigate(window.location.pathname.startsWith("/dev") ? "/dev/mission" : "/ambulancier")} aria-label="Retour">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="amb-mission-title-area">
          <h1 className="amb-mission-id-title">
            Mission #{intervention.id ? intervention.id.substring(0, 7).toUpperCase() : "NE-2481"}
          </h1>
          <span className="amb-priority-tag-red">
            <span style={{ fontSize: "1.2rem" }}>●</span> Critique
          </span>
        </div>
      </div>

      {/* Patient Card */}
      <div className="amb-card-detail">
        <div className="amb-avatar-circle-green">
          {patientName.split(" ").map(n => n.charAt(0)).join("").substring(0, 2).toUpperCase()}
        </div>
        <div className="amb-card-detail-info">
          <span className="amb-card-detail-title">{patientName}</span>
          <span className="amb-card-detail-subtitle">{patientDetails}</span>
        </div>
      </div>

      {/* Location Card */}
      <div className="amb-card-detail">
        <div className="amb-location-icon-wrapper">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div className="amb-card-detail-info">
          <span className="amb-card-detail-title">
            {intervention.alert?.location?.address?.split(",")[0] || "Quartier Hippodrome"}
          </span>
          <span className="amb-card-detail-subtitle">{locationDetails}</span>
        </div>
      </div>

      {/* Regulator Note Card */}
      <div className="amb-regulator-note-card">
        <div className="amb-note-header">
          <div className="amb-note-icon">i</div>
          <span>Note du régulateur</span>
        </div>
        <div className="amb-note-content">
          {regulatorNote}
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="amb-bottom-action-container">
        <button className="amb-action-btn-green" onClick={() => navigate(window.location.pathname.startsWith("/dev") ? "/dev/itineraire" : "/ambulancier/itineraire")}>
          {/* Navigation arrow icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Démarrer la navigation
        </button>
      </div>
    </div>
  );
}
