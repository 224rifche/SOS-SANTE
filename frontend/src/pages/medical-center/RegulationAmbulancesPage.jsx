import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ambulanceService } from "../../services/ambulanceService";

const STATUS_OPTIONS = ["AVAILABLE", "EN_ROUTE", "ON_MISSION", "MAINTENANCE", "OUT_OF_SERVICE"];

const STATUS_TAG_CLASS = {
  AVAILABLE: "available",
  EN_ROUTE: "busy",
  ON_MISSION: "busy",
  MAINTENANCE: "offline",
  OUT_OF_SERVICE: "offline",
};

export default function RegulationAmbulancesPage() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    ambulanceService.list({ size: 100 })
      .then((data) => setAmbulances(data.content || []))
      .catch(() => toast.error("Impossible de charger les ambulances."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (amb, status) => {
    setBusyId(amb.id);
    try {
      await ambulanceService.updateStatus(amb.id, status);
      toast.success(`${amb.registrationNumber} → ${status}`);
      load();
    } catch {
      toast.error("Échec du changement de statut.");
    } finally {
      setBusyId(null);
    }
  };

  const availableCount = ambulances.filter((a) => a.status === "AVAILABLE").length;

  return (
    <>
      <h2 className="reg-page-title">Ambulances</h2>
      <p className="reg-page-subtitle">{availableCount} disponible(s) sur {ambulances.length}</p>

      <div className="reg-panel">
        {loading ? (
          <div className="reg-loading">Chargement...</div>
        ) : ambulances.length === 0 ? (
          <div className="reg-empty-state">Aucune ambulance enregistrée.</div>
        ) : (
          <table className="reg-table">
            <thead>
              <tr>
                <th>Immatriculation</th>
                <th>Modèle</th>
                <th>Centre médical</th>
                <th>Statut</th>
                <th>Changer le statut</th>
              </tr>
            </thead>
            <tbody>
              {ambulances.map((amb) => (
                <tr key={amb.id}>
                  <td>{amb.registrationNumber}</td>
                  <td>{amb.model}</td>
                  <td>{amb.medicalCenterName || "—"}</td>
                  <td><span className={`reg-status-tag ${STATUS_TAG_CLASS[amb.status] || "offline"}`}>{amb.status}</span></td>
                  <td>
                    <select
                      className="reg-select"
                      value={amb.status}
                      disabled={busyId === amb.id}
                      onChange={(e) => handleStatusChange(amb, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
