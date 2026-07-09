import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/regulation.css";

// Centre par defaut : Bamako (zone couverte par le centre de regulation).
const DEFAULT_CENTER = [12.6392, -8.0029];

function divIcon(color, symbol, pulse = false) {
  return L.divIcon({
    html: `
      <div style="background-color:${color};color:#fff;width:30px;height:30px;border-radius:50%;border:2px solid #0b1220;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);${pulse ? "animation:reg-pulse 1.5s infinite;" : ""}">
        ${symbol}
      </div>
      ${pulse ? `<style>@keyframes reg-pulse{0%{transform:scale(1);}50%{transform:scale(1.15);}100%{transform:scale(1);}}</style>` : ""}
    `,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const patientIcon = divIcon("#ef4444", "📍", true);
const ambulanceIcon = divIcon("#22c55e", "🚑");
const hospitalIcon = divIcon("#3b82f6", "🏥");

/**
 * Repartit legerement en cercle les points qui partagent des coordonnees
 * identiques (ou tres proches), pour eviter que plusieurs marqueurs se
 * superposent exactement au meme pixel et en masquent certains.
 */
function spreadOverlappingPoints(points, getLat, getLng) {
  const buckets = new Map();
  points.forEach((point) => {
    const key = `${Number(getLat(point)).toFixed(4)},${Number(getLng(point)).toFixed(4)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(point);
  });

  const OFFSET_DEGREES = 0.0015;
  const result = [];
  buckets.forEach((group) => {
    if (group.length === 1) {
      result.push({ point: group[0], lat: Number(getLat(group[0])), lng: Number(getLng(group[0])) });
      return;
    }
    group.forEach((point, index) => {
      const angle = (2 * Math.PI * index) / group.length;
      result.push({
        point,
        lat: Number(getLat(point)) + OFFSET_DEGREES * Math.cos(angle),
        lng: Number(getLng(point)) + OFFSET_DEGREES * Math.sin(angle),
      });
    });
  });
  return result;
}

export default function RegulationMap({ alerts = [], ambulances = [], medicalCenters = [], tall = false }) {
  const alertPoints = alerts.filter((a) => a.latitude != null && a.longitude != null);
  const ambulancePoints = ambulances.filter((a) => a.gpsLatitude != null && a.gpsLongitude != null);
  const centerPoints = medicalCenters.filter((c) => c.latitude != null && c.longitude != null);

  const spreadAlerts = spreadOverlappingPoints(alertPoints, (a) => a.latitude, (a) => a.longitude);
  const spreadAmbulances = spreadOverlappingPoints(ambulancePoints, (a) => a.gpsLatitude, (a) => a.gpsLongitude);

  const center = alertPoints.length
    ? [Number(alertPoints[0].latitude), Number(alertPoints[0].longitude)]
    : DEFAULT_CENTER;

  return (
    <div className={`reg-map-wrapper ${tall ? "tall" : ""}`}>
      <div className="reg-map-legend">
        <span className="reg-map-legend-item">
          <span className="reg-map-legend-dot" style={{ backgroundColor: "#ef4444" }} /> Patients
        </span>
        <span className="reg-map-legend-item">
          <span className="reg-map-legend-dot" style={{ backgroundColor: "#22c55e" }} /> Ambulances
        </span>
        <span className="reg-map-legend-item">
          <span className="reg-map-legend-dot" style={{ backgroundColor: "#3b82f6" }} /> Hôpitaux
        </span>
      </div>
      <MapContainer center={center} zoom={12} style={{ width: "100%", height: "100%" }} zoomControl={tall}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {spreadAlerts.map(({ point: a, lat, lng }) => (
          <Marker key={a.id} position={[lat, lng]} icon={patientIcon}>
            <Popup>{a.categoryName} — {a.address || "position GPS"}</Popup>
          </Marker>
        ))}
        {spreadAmbulances.map(({ point: amb, lat, lng }) => (
          <Marker key={amb.id} position={[lat, lng]} icon={ambulanceIcon}>
            <Popup>{amb.registrationNumber} — {amb.status}</Popup>
          </Marker>
        ))}
        {centerPoints.map((c) => (
          <Marker key={c.id} position={[Number(c.latitude), Number(c.longitude)]} icon={hospitalIcon}>
            <Popup>{c.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}