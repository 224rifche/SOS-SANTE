import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ambulanceService } from "../../services/ambulanceService";
import AdminConfirmModal from "./AdminConfirmModal";

export default function AdminAmbulancesPage() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAmbulance, setPendingAmbulance] = useState(null);

  const load = () => {
    setLoading(true);
    ambulanceService.list({ size: 100 })
      .then((data) => setAmbulances(data.content || []))
      .catch(() => toast.error("Impossible de charger la liste des ambulances."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const confirmForce = async (reason) => {
    try {
      await ambulanceService.updateStatus(pendingAmbulance.id, "AVAILABLE");
      toast.success(`Statut forcé à Disponible par l'administrateur. Motif : ${reason}`);
      setPendingAmbulance(null);
      load();
    } catch {
      toast.error("Échec de la mise à jour du statut.");
    }
  };

  if (loading) return <p className="text-secondary">Chargement...</p>;

  return (
    <div>
      <div className="admin-supervision-banner">
        🛡️ Vue de supervision de la flotte. Intervention possible si un véhicule reste bloqué, avec motif obligatoire.
      </div>

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total ambulances</div>
          <div className="admin-kpi-value">{ambulances.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Disponibles</div>
          <div className="admin-kpi-value">{ambulances.filter((a) => a.status === "AVAILABLE").length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">En mission</div>
          <div className="admin-kpi-value">{ambulances.filter((a) => a.status !== "AVAILABLE").length}</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Immatriculation</th>
                <th>Modèle</th>
                <th>Centre médical</th>
                <th>Statut</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {ambulances.map((amb) => (
                <tr key={amb.id}>
                  <td className="fw-semibold">{amb.registrationNumber}</td>
                  <td className="small text-secondary">{amb.model || "—"}</td>
                  <td className="small text-secondary">{amb.medicalCenterName}</td>
                  <td><span className={`badge ${amb.status === "AVAILABLE" ? "bg-success" : "bg-warning text-dark"}`}>{amb.status}</span></td>
                  <td className="text-end">
                    {amb.status === "AVAILABLE" ? (
                      <span className="text-secondary small">—</span>
                    ) : (
                      <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => setPendingAmbulance(amb)}>
                        Forcer disponible
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {ambulances.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Aucune ambulance trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConfirmModal
        show={!!pendingAmbulance}
        title="Forcer disponible"
        description={`L'ambulance ${pendingAmbulance?.registrationNumber} sera forcée au statut "Disponible". À utiliser si le véhicule semble bloqué dans un statut incorrect.`}
        confirmLabel="Confirmer"
        onCancel={() => setPendingAmbulance(null)}
        onConfirm={confirmForce}
      />
    </div>
  );
}