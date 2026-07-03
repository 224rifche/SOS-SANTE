import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { medicalCenterService } from "../../services/medicalCenterService";
import RegulationMap from "./RegulationMap";
import { isActiveAlertStatus } from "./regulationUtils";

export default function RegulationMapPage() {
  const { connected, subscribe } = useWebSocket();
  const [alerts, setAlerts] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [alertsRes, ambulancesRes, centersRes] = await Promise.all([
        alertService.listAll(),
        ambulanceService.list({ size: 100 }),
        medicalCenterService.list({ size: 100 }),
      ]);
      setAlerts(alertsRes.filter((a) => isActiveAlertStatus(a.status)));
      setAmbulances(ambulancesRes.content || []);
      setMedicalCenters(centersRes.content || []);
    } catch {
      toast.error("Impossible de charger la carte temps réel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!connected) return undefined;
    const unsubAlerts = subscribe("/topic/alerts", () => load());
    return unsubAlerts;
  }, [connected, subscribe, load]);

  if (loading) return <div className="reg-loading">Chargement de la carte...</div>;

  return (
    <>
      <h2 className="reg-page-title">Carte temps réel</h2>
      <p className="reg-page-subtitle">
        {alerts.length} alerte(s) active(s) • {ambulances.filter((a) => a.status === "AVAILABLE").length} ambulance(s) disponible(s)
      </p>
      <RegulationMap alerts={alerts} ambulances={ambulances} medicalCenters={medicalCenters} tall />
    </>
  );
}
