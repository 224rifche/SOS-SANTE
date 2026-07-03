import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { dashboardService } from "../../services/dashboardService";
import { alertService } from "../../services/alertService";
import { ambulanceService } from "../../services/ambulanceService";
import { doctorService } from "../../services/doctorService";
import { interventionService } from "../../services/interventionService";
import RegulationMap from "./RegulationMap";
import { iconForCategory } from "./regulationIcons";
import { priorityLabel, priorityClass, isActiveAlertStatus, statusLabel, formatElapsed } from "./regulationUtils";

const ONLINE_DOCTOR_STATUSES = new Set(["ON_DUTY", "IN_CONSULTATION"]);

export default function RegulationDashboardPage() {
  const { connected, subscribe } = useWebSocket();

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [avgDelaySeconds, setAvgDelaySeconds] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState("");
  const [working, setWorking] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, alertsRes, ambulancesRes, doctorsRes, interventionsRes] = await Promise.all([
        dashboardService.getStats(),
        alertService.listAll(),
        ambulanceService.list({ size: 100 }),
        doctorService.list({ size: 100 }),
        interventionService.list({ size: 100 }),
      ]);

      setStats(statsRes);
      const active = alertsRes
        .filter((a) => isActiveAlertStatus(a.status))
        .sort((a, b) => a.priority - b.priority || new Date(a.createdAt) - new Date(b.createdAt));
      setAlerts(active);
      setAmbulances(ambulancesRes.content || []);
      setDoctors(doctorsRes.content || []);

      const alertsById = new Map(alertsRes.map((a) => [a.id, a]));
      const delays = (interventionsRes.content || [])
        .filter((i) => i.startedAt && alertsById.has(i.alertId))
        .map((i) => (new Date(i.startedAt) - new Date(alertsById.get(i.alertId).createdAt)) / 1000)
        .filter((s) => s >= 0);
      setAvgDelaySeconds(delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null);
    } catch {
      toast.error("Impossible de charger les données du centre de régulation.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!connected) return undefined;
    const unsubAlerts = subscribe("/topic/alerts", () => loadAll());
    const unsubInterventions = subscribe("/topic/interventions", (updated) => {
      loadAll();
      setIntervention((current) => (current && current.id === updated.id ? updated : current));
    });
    return () => { unsubAlerts(); unsubInterventions(); };
  }, [connected, subscribe, loadAll]);

  const openAlert = async (alert) => {
    setSelectedAlert(alert);
    setIntervention(null);
    setSelectedAmbulanceId("");
    try {
      const data = await interventionService.getByAlertId(alert.id);
      setIntervention(data);
      if (data.ambulanceId) setSelectedAmbulanceId(data.ambulanceId);
    } catch {
      toast.error("Impossible de charger la fiche d'intervention.");
    }
  };

  const availableAmbulances = ambulances.filter((a) => a.status === "AVAILABLE");
  const ambulanceOptions = intervention?.ambulanceId
    ? [...availableAmbulances, ...ambulances.filter((a) => a.id === intervention.ambulanceId)]
    : availableAmbulances;

  const handleValidateAndAssign = async () => {
    if (!selectedAlert || !intervention || !selectedAmbulanceId) return;
    setWorking(true);
    try {
      if (selectedAlert.status === "EN_ATTENTE_VALIDATION") {
        await alertService.updateStatus(selectedAlert.id, "VALIDEE");
      }
      const updated = await interventionService.updateStatus(intervention.id, {
        newStatus: "AMBULANCE_AFFECTEE",
        ambulanceId: selectedAmbulanceId,
      });
      setIntervention(updated);
      toast.success("Alerte validée et ambulance affectée.");
      loadAll();
    } catch {
      toast.error("Échec de la validation / affectation.");
    } finally {
      setWorking(false);
    }
  };

  const handleReassign = async () => {
    if (!intervention || !selectedAmbulanceId) return;
    setWorking(true);
    try {
      const updated = await interventionService.updateStatus(intervention.id, {
        newStatus: "AMBULANCE_AFFECTEE",
        ambulanceId: selectedAmbulanceId,
      });
      setIntervention(updated);
      toast.success("Ambulance réaffectée.");
      loadAll();
    } catch {
      toast.error("Échec de la réaffectation.");
    } finally {
      setWorking(false);
    }
  };

  const availableCount = ambulances.filter((a) => a.status === "AVAILABLE").length;
  const onlineDoctorsCount = doctors.filter((d) => ONLINE_DOCTOR_STATUSES.has(d.status)).length;

  if (loading) {
    return <div className="reg-loading">Chargement du tableau de bord...</div>;
  }

  return (
    <>
      <div className="reg-stats-row">
        <StatCard label="Alertes actives" value={alerts.length} icon="🚨" iconBg="var(--reg-red-bg)" />
        <StatCard
          label="Ambulances dispo."
          value={`${availableCount}/${ambulances.length}`}
          icon="🚑"
          iconBg="var(--reg-green-bg)"
          hint={`${ambulances.filter((a) => a.status === "ON_MISSION" || a.status === "EN_ROUTE").length} en mission`}
        />
        <StatCard
          label="Médecins en ligne"
          value={onlineDoctorsCount}
          icon="🩺"
          iconBg="var(--reg-blue-badge-bg)"
          hint="Joignables"
        />
        <StatCard
          label="Délai moyen"
          value={avgDelaySeconds != null ? `${avgDelaySeconds}s` : "—"}
          icon="⏱️"
          iconBg="var(--reg-orange-bg)"
        />
      </div>

      <div className="reg-two-col">
        <div className="reg-panel">
          <div className="reg-panel-header">
            <h2 className="reg-panel-title">File d'alertes</h2>
            <span className="reg-panel-badge">{alerts.filter((a) => a.priority === 1).length} P1</span>
          </div>
          <div className="reg-alerts-list">
            {alerts.length === 0 && (
              <div className="reg-empty-state">Aucune alerte active pour le moment.</div>
            )}
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`reg-alert-row ${priorityClass(alert.priority)} ${selectedAlert?.id === alert.id ? "selected" : ""}`}
                onClick={() => openAlert(alert)}
              >
                <span className={`reg-priority-badge ${priorityClass(alert.priority)}`}>{priorityLabel(alert.priority)}</span>
                <span className="reg-alert-icon">{iconForCategory(alert.categoryName)}</span>
                <div className="reg-alert-main">
                  <span className="reg-alert-title">{alert.categoryName}</span>
                  <span className="reg-alert-subtitle">{alert.address || `${alert.latitude}, ${alert.longitude}`}</span>
                </div>
                <div className="reg-alert-meta">
                  <span className="reg-alert-time">{formatElapsed(alert.createdAt)}</span>
                  <span className="reg-alert-status-tag">{statusLabel(alert.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="reg-panel">
            <div className="reg-panel-header">
              <h2 className="reg-panel-title">Carte</h2>
            </div>
            <div style={{ padding: "12px" }}>
              <RegulationMap alerts={selectedAlert ? [selectedAlert] : alerts} ambulances={ambulances} />
            </div>
          </div>

          <div className="reg-panel reg-detail-card">
            {!selectedAlert && (
              <div className="reg-empty-state">Sélectionnez une alerte pour afficher sa fiche d'intervention.</div>
            )}
            {selectedAlert && (
              <>
                <div className="reg-detail-header">
                  <h3 className="reg-detail-title">
                    {iconForCategory(selectedAlert.categoryName)} {selectedAlert.categoryName}{" "}
                    <span className={`reg-priority-badge ${priorityClass(selectedAlert.priority)}`}>
                      {priorityLabel(selectedAlert.priority)}
                    </span>
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--reg-text-muted)" }}>
                    {selectedAlert.citizenFirstName || "Patient"} {selectedAlert.citizenLastName ? `${selectedAlert.citizenLastName[0]}.` : ""}
                  </span>
                </div>

                <div className="reg-detail-grid">
                  <div className="reg-detail-item">
                    <span className="reg-detail-label">Motif</span>
                    <span className="reg-detail-value">{selectedAlert.description || selectedAlert.categoryName}</span>
                  </div>
                  <div className="reg-detail-item">
                    <span className="reg-detail-label">Groupe sanguin</span>
                    <span className="reg-detail-value">{selectedAlert.bloodGroup || "Inconnu"}</span>
                  </div>
                  <div className="reg-detail-item">
                    <span className="reg-detail-label">Localisation</span>
                    <span className="reg-detail-value">{selectedAlert.address || `${selectedAlert.latitude}, ${selectedAlert.longitude}`}</span>
                  </div>
                </div>

                {intervention && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <select
                      className="reg-select"
                      value={selectedAmbulanceId}
                      onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                      disabled={working}
                    >
                      <option value="">Choisir une ambulance...</option>
                      {ambulanceOptions.map((amb) => (
                        <option key={amb.id} value={amb.id}>
                          {amb.registrationNumber} {amb.id === intervention.ambulanceId ? "(actuelle)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="reg-actions-row">
                  {intervention && !intervention.ambulanceId && (
                    <button
                      className="reg-btn reg-btn-primary"
                      disabled={working || !selectedAmbulanceId}
                      onClick={handleValidateAndAssign}
                    >
                      ✓ Valider & affecter
                    </button>
                  )}
                  {intervention?.ambulanceId && (
                    <button
                      className="reg-btn reg-btn-secondary"
                      disabled={working || !selectedAmbulanceId || selectedAmbulanceId === intervention.ambulanceId}
                      onClick={handleReassign}
                    >
                      ⇄ Réaffecter
                    </button>
                  )}
                  <a
                    className="reg-btn reg-btn-outline-danger"
                    href={selectedAlert.citizenPhone ? `tel:${selectedAlert.citizenPhone}` : undefined}
                    onClick={(e) => { if (!selectedAlert.citizenPhone) e.preventDefault(); }}
                  >
                    📞 Rappeler
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon, iconBg, hint }) {
  return (
    <div className="reg-stat-card">
      <div className="reg-stat-top">
        <span className="reg-stat-label">{label}</span>
        <span className="reg-stat-icon" style={{ backgroundColor: iconBg }}>{icon}</span>
      </div>
      <span className="reg-stat-value">{value}</span>
      {hint && <span className="reg-stat-delta">{hint}</span>}
    </div>
  );
}
