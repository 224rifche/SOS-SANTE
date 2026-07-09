import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { dashboardService } from "../../services/dashboardService";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { interventionService } from "../../services/interventionService";
import RegulationMap from "../medical-center/RegulationMap";
import AdminConfirmModal from "./AdminConfirmModal";

const STATUS_LABELS = {
  ALERTE_CREEE: "Créée", EN_ATTENTE_VALIDATION: "En attente", VALIDEE: "Validée",
  REJETEE: "Rejetée", AMBULANCE_AFFECTEE: "Ambulance affectée", AMBULANCE_EN_ROUTE: "En route",
  ARRIVEE_SUR_LES_LIEUX: "Sur place", INTERVENTION_CLOTUREE: "Clôturée", ARCHIVEE: "Archivée",
};
const ACTIVE_STATUSES = new Set([
  "EN_ATTENTE_VALIDATION", "VALIDEE", "AMBULANCE_AFFECTEE", "AMBULANCE_EN_ROUTE", "ARRIVEE_SUR_LES_LIEUX",
]);
const PAGE_SIZE = 4;

function priorityLabel(p) {
  if (p === 1) return "P1 - Critique";
  if (p === 2) return "P2 - Haute";
  return "P3 - Standard";
}

export default function AdminRegulationPage() {
  const { connected, subscribe } = useWebSocket();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [closedInterventions, setClosedInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(0);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // "reassign" | "close" | "reject"

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, alertsRes, ambulancesRes, interventionsRes] = await Promise.all([
        dashboardService.getStats(),
        alertService.listAll(),
        ambulanceService.list({ size: 100 }),
        interventionService.list({ size: 100 }),
      ]);
      setStats(statsRes);

      const active = alertsRes
        .filter((a) => ACTIVE_STATUSES.has(a.status))
        .sort((a, b) => a.priority - b.priority || new Date(a.createdAt) - new Date(b.createdAt));
      setAlerts(active);
      setAmbulances(ambulancesRes.content || []);

      const closed = (interventionsRes.content || [])
        .filter((i) => i.currentStatus === "INTERVENTION_CLOTUREE" || i.archived)
        .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
        .slice(0, 10);
      setClosedInterventions(closed);
    } catch {
      toast.error("Impossible de charger les données de supervision.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!connected) return undefined;
    return subscribe("/topic/alerts", () => loadAll());
  }, [connected, subscribe, loadAll]);

  // Abonnement dynamique : une position en temps reel par ambulance actuellement
  // affichee, pour que la carte bouge vraiment quand un ambulancier se deplace.
  useEffect(() => {
    if (!connected || ambulances.length === 0) return undefined;

    const unsubscribers = ambulances.map((amb) =>
      subscribe(`/topic/ambulances/${amb.id}/position`, (updated) => {
        setAmbulances((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      })
    );

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [connected, subscribe, ambulances.map((a) => a.id).join(",")]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        !search ||
        (alert.categoryName || "").toLowerCase().includes(search.toLowerCase()) ||
        (alert.citizenFirstName || "").toLowerCase().includes(search.toLowerCase()) ||
        (alert.citizenLastName || "").toLowerCase().includes(search.toLowerCase()) ||
        (alert.address || "").toLowerCase().includes(search.toLowerCase());
      const matchesPriority = !priorityFilter || String(alert.priority) === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [alerts, search, priorityFilter]);

  useEffect(() => { setPage(0); }, [search, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const pagedAlerts = filteredAlerts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const openAlert = async (alert) => {
    setSelectedAlert(alert);
    setIntervention(null);
    setSelectedAmbulanceId("");
    try {
      const data = await interventionService.getByAlertId(alert.id);
      setIntervention(data);
      if (data.ambulanceId) setSelectedAmbulanceId(data.ambulanceId);
    } catch {
      // Pas d'intervention associée - normal pour une alerte tout juste créée.
    }
  };

  const confirmReassign = async (reason) => {
    try {
      const updated = await interventionService.updateStatus(intervention.id, {
        newStatus: intervention.currentStatus,
        ambulanceId: selectedAmbulanceId,
      });
      setIntervention(updated);
      toast.success(`Ambulance réaffectée par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      loadAll();
    } catch {
      toast.error("Échec de la réaffectation forcée.");
    }
  };

  const confirmClose = async (reason) => {
    try {
      const updated = await interventionService.updateStatus(intervention.id, { newStatus: "INTERVENTION_CLOTUREE" });
      setIntervention(updated);
      toast.success(`Intervention clôturée par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      loadAll();
    } catch {
      toast.error("Échec de la clôture forcée.");
    }
  };

  const confirmReject = async (reason) => {
    try {
      await alertService.updateStatus(selectedAlert.id, "REJETEE");
      toast.success(`Alerte rejetée par l'administrateur. Motif : ${reason}`);
      setPendingAction(null);
      setSelectedAlert(null);
      setIntervention(null);
      loadAll();
    } catch {
      toast.error("Échec du rejet de l'alerte.");
    }
  };

  const availableAmbulances = ambulances.filter((a) => a.status === "AVAILABLE");
  const ambulanceOptions = intervention?.ambulanceId
    ? [...availableAmbulances, ...ambulances.filter((a) => a.id === intervention.ambulanceId)]
    : availableAmbulances;

  const doctorsCount = stats?.usersByRole?.DOCTOR ?? 0;

  if (loading) return <p className="text-secondary">Chargement...</p>;

  return (
    <div>
      <div className="admin-supervision-banner">
        🛡️ Vue de supervision en lecture. Toute intervention exige un motif écrit, conservé dans le journal d'audit.
      </div>

      <div className="admin-kpi-row">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Alertes actives</div>
          <div className="admin-kpi-value">{alerts.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Ambulances disponibles</div>
          <div className="admin-kpi-value">{availableAmbulances.length}/{ambulances.length}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Médecins (total)</div>
          <div className="admin-kpi-value">{doctorsCount}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Temps réel</div>
          <div className="admin-kpi-value" style={{ color: connected ? "#28a745" : "#dc3545" }}>
            {connected ? "Actif" : "Hors ligne"}
          </div>
        </div>
      </div>

      <div className="admin-panel mb-3">
        <div className="admin-panel-header d-flex justify-content-between align-items-center">
          <span>Carte temps réel</span>
          <span className="small text-secondary">
            {connected ? "🟢 Positions des ambulances mises à jour en direct" : "🔴 Connexion temps réel indisponible"}
          </span>
        </div>
        <div style={{ padding: "12px" }}>
          <RegulationMap alerts={selectedAlert ? [selectedAlert] : alerts} ambulances={ambulances} />
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <div className="col-lg-6">
          <div className="admin-panel">
            <div className="admin-panel-header">Fiche d'intervention</div>
            <div className="p-3">
              {!selectedAlert && <p className="text-secondary mb-0">Sélectionnez une alerte pour voir le détail.</p>}
              {selectedAlert && (
                <>
                  <h6 className="fw-bold">{selectedAlert.categoryName}</h6>
                  <p className="small text-secondary mb-2">
                    {selectedAlert.citizenFirstName} {selectedAlert.citizenLastName} — {selectedAlert.citizenPhone || "Tél. non renseigné"}
                  </p>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <div className="small text-secondary">Groupe sanguin</div>
                      <div className="fw-semibold small">{selectedAlert.bloodGroup || "Inconnu"}</div>
                    </div>
                    <div className="col-6">
                      <div className="small text-secondary">Localisation</div>
                      <div className="fw-semibold small">{selectedAlert.address || `${selectedAlert.latitude}, ${selectedAlert.longitude}`}</div>
                    </div>
                  </div>
                  <p className="small mb-3">{selectedAlert.description || "Aucune description."}</p>

                  {intervention && (
                    <p className="small mb-3">
                      Statut intervention : <strong>{STATUS_LABELS[intervention.currentStatus] || intervention.currentStatus}</strong>
                    </p>
                  )}

                  <div className="admin-intervention-zone">
                    <div className="admin-intervention-label">🛡️ Zone d'intervention administrative</div>

                    {intervention && (
                      <>
                        <select
                          className="form-select form-select-sm mb-2"
                          value={selectedAmbulanceId}
                          onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                        >
                          <option value="">Choisir une ambulance...</option>
                          {ambulanceOptions.map((amb) => (
                            <option key={amb.id} value={amb.id}>
                              {amb.registrationNumber} {amb.id === intervention.ambulanceId ? "(actuelle)" : ""}
                            </option>
                          ))}
                        </select>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <button type="button" className="btn btn-sm btn-outline-warning" disabled={!selectedAmbulanceId} onClick={() => setPendingAction("reassign")}>
                            ⇄ Forcer réaffectation
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPendingAction("close")}>
                            ✕ Forcer clôture
                          </button>
                        </div>
                      </>
                    )}

                    {selectedAlert.status === "EN_ATTENTE_VALIDATION" ? (
                      <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setPendingAction("reject")}>
                        🗑 Rejeter l'alerte
                      </button>
                    ) : (
                      <p className="small text-secondary fst-italic mb-0">
                        Cette alerte est déjà validée : elle ne peut plus être rejetée.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="admin-panel">
            <div className="admin-panel-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <span>File d'alertes actives</span>
              <div className="d-flex flex-wrap gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: "150px" }}
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-select form-select-sm"
                  style={{ width: "130px" }}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">Toute priorité</option>
                  <option value="1">P1 - Critique</option>
                  <option value="2">P2 - Haute</option>
                  <option value="3">P3 - Standard</option>
                </select>
              </div>
            </div>
            <div>
              {pagedAlerts.length === 0 && <p className="text-secondary text-center py-4 mb-0">Aucune alerte ne correspond.</p>}
              {pagedAlerts.map((alert) => {
                const isCritical = alert.priority === 1;
                return (
                  <div
                    key={alert.id}
                    className="px-3 py-2 border-bottom"
                    style={{
                      cursor: "pointer",
                      background: selectedAlert?.id === alert.id ? "#f8f9fa" : (isCritical ? "rgba(220,53,69,0.05)" : "transparent"),
                      borderLeft: isCritical ? "4px solid #dc3545" : "4px solid transparent",
                    }}
                    onClick={() => openAlert(alert)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold small">{alert.categoryName}</span>
                      <span className={`badge small ${isCritical ? "bg-danger" : "bg-secondary bg-opacity-25 text-dark"}`}>
                        {priorityLabel(alert.priority)}
                      </span>
                    </div>
                    <div className="small text-secondary">{alert.address || `${alert.latitude}, ${alert.longitude}`}</div>
                    <div className="small text-secondary">
                      {alert.citizenFirstName} {alert.citizenLastName} — {STATUS_LABELS[alert.status] || alert.status}
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredAlerts.length > 0 && (
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                <span className="small text-secondary">Page {page + 1} sur {totalPages}</span>
                <div className="btn-group">
                  <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Précédent</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Suivant</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-panel mt-3">
        <div className="admin-panel-header">Interventions récemment clôturées</div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Clôturée le</th>
                <th>Centre médical</th>
                <th>Ambulance</th>
                <th>Médecin</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {closedInterventions.map((item) => (
                <tr key={item.id}>
                  <td className="small text-secondary">
                    {item.completedAt ? new Date(item.completedAt).toLocaleString("fr-FR") : "—"}
                  </td>
                  <td className="small">{item.medicalCenterName}</td>
                  <td className="small text-secondary">{item.ambulanceRegistrationNumber || "—"}</td>
                  <td className="small text-secondary">{item.doctorName || "—"}</td>
                  <td><span className="badge bg-success bg-opacity-25 text-dark">{STATUS_LABELS[item.currentStatus] || item.currentStatus}</span></td>
                </tr>
              ))}
              {closedInterventions.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Aucune intervention clôturée récemment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConfirmModal
        show={pendingAction === "reassign"}
        title="Forcer la réaffectation"
        description="L'ambulance sélectionnée sera assignée à cette intervention, quel que soit son état actuel."
        confirmLabel="Confirmer"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmReassign}
      />

      <AdminConfirmModal
        show={pendingAction === "close"}
        title="Forcer la clôture"
        description="Cette intervention sera marquée comme clôturée, quel que soit son état d'avancement. À utiliser pour débloquer une situation figée."
        dangerous
        confirmLabel="Forcer la clôture"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmClose}
      />

      <AdminConfirmModal
        show={pendingAction === "reject"}
        title="Rejeter l'alerte"
        description={`L'alerte "${selectedAlert?.categoryName}" sera marquée comme rejetée. À utiliser uniquement pour une alerte erronée ou un doublon.`}
        dangerous
        confirmLabel="Rejeter l'alerte"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}