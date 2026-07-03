import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { interventionService } from "../../services/interventionService";
import { statusLabel } from "./regulationUtils";

export default function RegulationHistoryPage() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    interventionService.list({ size: 100 })
      .then((data) => setInterventions(data.content || []))
      .catch(() => toast.error("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const closed = interventions
    .filter((i) => i.currentStatus === "INTERVENTION_CLOTUREE" || i.currentStatus === "ARCHIVEE" || i.archived)
    .sort((a, b) => new Date(b.completedAt || b.startedAt || 0) - new Date(a.completedAt || a.startedAt || 0));

  return (
    <>
      <h2 className="reg-page-title">Historique</h2>
      <p className="reg-page-subtitle">{closed.length} intervention(s) clôturée(s)</p>

      <div className="reg-panel">
        {loading ? (
          <div className="reg-loading">Chargement...</div>
        ) : closed.length === 0 ? (
          <div className="reg-empty-state">Aucune intervention clôturée pour le moment.</div>
        ) : (
          <table className="reg-table">
            <thead>
              <tr>
                <th>Centre médical</th>
                <th>Ambulance</th>
                <th>Médecin</th>
                <th>Statut final</th>
                <th>Démarrée</th>
                <th>Terminée</th>
              </tr>
            </thead>
            <tbody>
              {closed.map((i) => (
                <tr key={i.id}>
                  <td>{i.medicalCenterName || "—"}</td>
                  <td>{i.ambulanceRegistrationNumber || "—"}</td>
                  <td>{i.doctorName || "—"}</td>
                  <td>{statusLabel(i.currentStatus)}</td>
                  <td>{i.startedAt ? new Date(i.startedAt).toLocaleString("fr-FR") : "—"}</td>
                  <td>{i.completedAt ? new Date(i.completedAt).toLocaleString("fr-FR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
