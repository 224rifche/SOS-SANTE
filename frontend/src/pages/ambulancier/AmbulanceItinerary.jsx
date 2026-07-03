import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import { interventionService } from "../../services/interventionService";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { geolocationService } from "../../services/geolocationService";
import { useGeolocationWatch } from "../../hooks/useGeolocationWatch";
import { useAmbulanceGpsSync } from "../../hooks/useAmbulanceGpsSync";
import "../../styles/ambulancier.css";

const DEFAULT_CENTER = [12.6392, -8.0029];

const ambulanceIcon = L.divIcon({
  html: `
    <div style="background-color:#135431;color:white;width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="1" y="3" width="15" height="13" rx="2" />
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
    <div style="background-color:#E53935;color:white;width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function estimateEtaMinutes(distanceKm) {
  if (distanceKm == null) return null;
  return Math.max(1, Math.round(distanceKm * 2.5));
}

function formatEtaTime(minutes) {
  if (minutes == null) return "—";
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function AmbulanceItinerary() {
  const navigate = useNavigate();

  const [intervention, setIntervention] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [ambulanceData, setAmbulanceData] = useState(null);

  const { position: gpsPosition, error: gpsError } = useGeolocationWatch(isNavigating);
  useAmbulanceGpsSync(intervention?.ambulanceId, gpsPosition, isNavigating);

  const loadMission = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const interventionData = await interventionService.getActiveIntervention();
      if (!interventionData) {
        setError("Aucune mission active pour la navigation.");
        return;
      }
      setIntervention(interventionData);

      if (interventionData.alertId) {
        const alert = await alertService.getAlertById(interventionData.alertId);
        setAlertData(alert);
      }

      if (interventionData.ambulanceId) {
        const amb = await ambulanceService.getById(interventionData.ambulanceId);
        setAmbulanceData(amb);
      }

      const enRouteStatuses = new Set(["AMBULANCE_EN_ROUTE", "ARRIVEE_SUR_LES_LIEUX", "PATIENT_PRIS_EN_CHARGE", "TRANSPORT_VERS_CENTRE"]);
      if (enRouteStatuses.has(interventionData.currentStatus)) {
        setIsNavigating(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Aucune mission active pour la navigation.");
      } else {
        setError(err.response?.data?.message || "Impossible de charger la mission.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMission(); }, [loadMission]);

  const patientPos = useMemo(() => {
    if (alertData?.latitude == null || alertData?.longitude == null) return null;
    return [Number(alertData.latitude), Number(alertData.longitude)];
  }, [alertData]);

  const ambulancePos = useMemo(() => {
    if (gpsPosition) return [gpsPosition.latitude, gpsPosition.longitude];
    if (ambulanceData?.gpsLatitude != null && ambulanceData?.gpsLongitude != null) {
      return [Number(ambulanceData.gpsLatitude), Number(ambulanceData.gpsLongitude)];
    }
    return null;
  }, [gpsPosition, ambulanceData]);

  const routeLine = useMemo(() => {
    if (!ambulancePos || !patientPos) return [];
    return [ambulancePos, patientPos];
  }, [ambulancePos, patientPos]);

  const mapCenter = useMemo(() => {
    if (ambulancePos && patientPos) {
      return [
        (ambulancePos[0] + patientPos[0]) / 2,
        (ambulancePos[1] + patientPos[1]) / 2,
      ];
    }
    return patientPos || ambulancePos || DEFAULT_CENTER;
  }, [ambulancePos, patientPos]);

  useEffect(() => {
    if (!ambulancePos || !patientPos) return undefined;

    let cancelled = false;
    geolocationService.calculateDistance(
      { latitude: ambulancePos[0], longitude: ambulancePos[1] },
      { latitude: patientPos[0], longitude: patientPos[1] }
    )
      .then((res) => { if (!cancelled) setDistanceKm(res.distanceKm); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [ambulancePos?.[0], ambulancePos?.[1], patientPos?.[0], patientPos?.[1]]);

  const etaMinutes = estimateEtaMinutes(distanceKm);
  const arrivalTimeStr = formatEtaTime(etaMinutes);

  const handleStartNavigation = async () => {
    if (!intervention?.ambulanceId) {
      toast.error("Aucune ambulance assignée à cette mission.");
      return;
    }
    setStarting(true);
    try {
      if (intervention.currentStatus === "AMBULANCE_AFFECTEE") {
        const updated = await interventionService.updateStatus(intervention.id, {
          newStatus: "AMBULANCE_EN_ROUTE",
        });
        setIntervention(updated);
      }
      await ambulanceService.updateStatus(intervention.ambulanceId, "EN_ROUTE");
      setIsNavigating(true);
      toast.success("Navigation démarrée. Position transmise au centre.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de démarrer la navigation.");
    } finally {
      setStarting(false);
    }
  };

  const bannerTitle = distanceKm != null
    ? `${distanceKm < 1 ? Math.round(distanceKm * 1000) : distanceKm.toFixed(1)} ${distanceKm < 1 ? "m" : "km"}`
    : "Calcul en cours...";

  const bannerSubtitle = alertData?.address
    || (patientPos ? "Direction position GPS du patient" : "Destination inconnue");

  if (loading) {
    return (
      <div className="amb-gps-container d-flex justify-content-center align-items-center">
        <div>Chargement de la navigation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="amb-gps-container d-flex flex-column justify-content-center align-items-center p-4 text-center">
        <p className="text-secondary mb-3">{error}</p>
        <button type="button" className="amb-primary-btn" onClick={() => navigate("/ambulancier")}>
          Retour aux missions
        </button>
      </div>
    );
  }

  return (
    <div className="amb-gps-container">
      <div className="amb-gps-top-banner">
        <div className="amb-gps-banner-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </div>
        <div className="amb-gps-banner-info">
          <span className="amb-gps-banner-title">
            {isNavigating ? `À ${bannerTitle}` : "Prêt à partir"}
          </span>
          <span className="amb-gps-banner-subtitle">{bannerSubtitle}</span>
        </div>
      </div>

      <button
        type="button"
        className="amb-gps-back-btn"
        onClick={() => navigate("/ambulancier")}
        aria-label="Retour"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {!isNavigating && (
        <button
          type="button"
          onClick={handleStartNavigation}
          disabled={starting || !patientPos}
          style={{
            position: "absolute",
            top: "140px",
            left: "20px",
            zIndex: 1000,
            backgroundColor: "#135431",
            color: "white",
            border: "none",
            borderRadius: "24px",
            padding: "10px 16px",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            cursor: starting ? "wait" : "pointer",
          }}
        >
          {starting ? "Démarrage..." : "Démarrer la navigation"}
        </button>
      )}

      {gpsError && isNavigating && (
        <div style={{
          position: "absolute",
          top: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "#FFF3E0",
          color: "#E65100",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "0.8rem",
          maxWidth: "90%",
          textAlign: "center",
        }}
        >
          GPS : {gpsError}
        </div>
      )}

      <div className="amb-gps-map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routeLine.length === 2 && (
            <Polyline positions={routeLine} color="#135431" weight={5} opacity={0.85} />
          )}

          {ambulancePos && <Marker position={ambulancePos} icon={ambulanceIcon} />}
          {patientPos && <Marker position={patientPos} icon={patientIcon} />}
        </MapContainer>
      </div>

      <div className="amb-gps-bottom-card">
        <div className="amb-gps-card-content">
          <div className="amb-gps-card-left">
            <span className="amb-gps-time-eta">
              {etaMinutes != null ? `${etaMinutes} min` : "—"}
            </span>
            <span className="amb-gps-distance-time">
              {distanceKm != null
                ? `${distanceKm.toFixed(1).replace(".", ",")} km • arrivée ${arrivalTimeStr}`
                : `Mission #${String(intervention?.id || "").substring(0, 7).toUpperCase()}`}
            </span>
            {alertData?.categoryName && (
              <span className="amb-gps-distance-time" style={{ display: "block", marginTop: "4px" }}>
                {alertData.categoryName}
              </span>
            )}
          </div>

          <button
            type="button"
            className="amb-gps-voice-btn"
            onClick={() => {
              setVoiceMuted((m) => !m);
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
