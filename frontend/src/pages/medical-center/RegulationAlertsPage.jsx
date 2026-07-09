import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import { priorityLabel, priorityClass, statusLabel, formatElapsed } from "./regulationUtils";
import { iconForCategory } from "./regulationIcons";

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "EN_ATTENTE_VALIDATION", label: "En attente" },
  { value: "VALIDEE", label: "Validées" },
  { value: "AMBULANCE_AFFECTEE", label: "Ambulance affectée" },
  { value: "AMBULANCE_EN_ROUTE", label: "En route" },
  { value: "ARRIVEE_SUR_LES_LIEUX", label: "Sur place" },
  { value: "REJETEE", label: "Rejetées" },
];

export default function RegulationAlertsPage() {
  const { connected, subscribe } = useWebSocket();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    alertService.listAll()
      .then((data) => setAlerts(data))
      .catch(() => toast.error("Impossible de charger les alertes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!connected) return undefined;
    return subscribe("/topic/alerts", () => load());
  }, [connected, subscribe, load]);

  const handleDecision = async (alert, status) => {
    setBusyId(alert.id);
    try {
      await alertService.updateStatus(alert.id, status);
      toast.success(status === "VALIDEE" ? "Alerte validée." : "Alerte rejetée.");
      load();
    } catch {
      toast.error("Échec de la mise à jour de l'alerte.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = alerts.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (priorityFilter && String(a.priority) !== priorityFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const haystack = `${a.categoryName} ${a.address || ""} ${a.description || ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <h2 className="reg-page-title">Alertes</h2>
      <p className="reg-page-subtitle">{filtered.length} alerte(s) affichée(s) sur {alerts.length}</p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          className="reg-search-input"
          placeholder="Rechercher (motif, adresse...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="reg-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="reg-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">Toutes priorités</option>
          <option value="1">P1</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
        </select>
      </div>

      <div className="reg-panel">
        {loading ? (
          <div className="reg-loading">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="reg-empty-state">Aucune alerte ne correspond à ces critères.</div>
        ) : (
          <div className="reg-table-responsive">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Priorité</th>
                  <th>Motif</th>
                  <th>Localisation</th>
                  <th>Statut</th>
                  <th>Reçue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td><span className={`reg-priority-badge ${priorityClass(a.priority)}`}>{priorityLabel(a.priority)}</span></td>
                    <td>{iconForCategory(a.categoryName)} {a.categoryName}</td>
                    <td>{a.address || `${a.latitude}, ${a.longitude}`}</td>
                    <td>{statusLabel(a.status)}</td>
                    <td>{formatElapsed(a.createdAt)}</td>
                    <td>
                      {a.status === "EN_ATTENTE_VALIDATION" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="reg-btn reg-btn-primary"
                            style={{ padding: "6px 10px" }}
                            disabled={busyId === a.id}
                            onClick={() => handleDecision(a, "VALIDEE")}
                          >
                            Valider
                          </button>
                          <button
                            className="reg-btn reg-btn-outline-danger"
                            style={{ padding: "6px 10px" }}
                            disabled={busyId === a.id}
                            onClick={() => handleDecision(a, "REJETEE")}
                          >
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/medical-center/alerts/${a.id}`}
                          className="reg-btn reg-btn-secondary"
                          style={{ padding: "6px 10px", textDecoration: "none" }}
                        >
                          Voir
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
