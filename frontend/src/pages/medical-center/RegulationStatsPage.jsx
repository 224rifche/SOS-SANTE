import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { dashboardService } from "../../services/dashboardService";
import { statusLabel } from "./regulationUtils";

const ALERT_STATUS_COLORS = {
  EN_ATTENTE_VALIDATION: "var(--reg-orange)",
  VALIDEE: "var(--reg-blue)",
  REJETEE: "var(--reg-red)",
  INTERVENTION_CLOTUREE: "var(--reg-green)",
  ARCHIVEE: "var(--reg-text-muted)",
};

const AMBULANCE_STATUS_COLORS = {
  AVAILABLE: "var(--reg-green)",
  EN_ROUTE: "var(--reg-orange)",
  ON_MISSION: "var(--reg-red)",
  MAINTENANCE: "var(--reg-text-muted)",
  OUT_OF_SERVICE: "var(--reg-text-muted)",
};

export default function RegulationStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    dashboardService.getStats()
      .then((data) => {
        setStats(data);
        setTimeout(() => setAnimate(true), 50);
      })
      .catch(() => toast.error("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="reg-loading">Chargement des statistiques...</div>;
  if (!stats) return <div className="reg-empty-state">Statistiques indisponibles.</div>;

  const maxAlerts = Math.max(1, ...Object.values(stats.alertsByStatus));
  const maxAmbulances = Math.max(1, ...Object.values(stats.ambulancesByStatus));

  return (
    <>
      <h2 className="reg-page-title">Statistiques</h2>
      <p className="reg-page-subtitle">
        {stats.totalAlerts} alerte(s) au total • {stats.alertsToday} aujourd'hui • {stats.activeInterventions} intervention(s) active(s)
      </p>

      <div className="reg-panel" style={{ padding: "18px" }}>
        <h3 className="reg-panel-title" style={{ marginBottom: "10px" }}>Alertes par statut</h3>
        {Object.entries(stats.alertsByStatus).map(([status, count]) => (
          <div key={status} className="reg-bar-row">
            <span className="reg-bar-label">{statusLabel(status)}</span>
            <div className="reg-bar-track">
              <div
                className="reg-bar-fill"
                style={{
                  width: animate ? `${(count / maxAlerts) * 100}%` : "0%",
                  backgroundColor: ALERT_STATUS_COLORS[status] || "var(--reg-blue)",
                }}
              />
            </div>
            <span className="reg-bar-value">{count}</span>
          </div>
        ))}
      </div>

      <div className="reg-panel" style={{ padding: "18px" }}>
        <h3 className="reg-panel-title" style={{ marginBottom: "10px" }}>Ambulances par statut</h3>
        {Object.entries(stats.ambulancesByStatus).map(([status, count]) => (
          <div key={status} className="reg-bar-row">
            <span className="reg-bar-label">{status}</span>
            <div className="reg-bar-track">
              <div
                className="reg-bar-fill"
                style={{
                  width: animate ? `${(count / maxAmbulances) * 100}%` : "0%",
                  backgroundColor: AMBULANCE_STATUS_COLORS[status] || "var(--reg-blue)",
                }}
              />
            </div>
            <span className="reg-bar-value">{count}</span>
          </div>
        ))}
      </div>

      <div className="reg-stats-row">
        <div className="reg-stat-card">
          <span className="reg-stat-label">Total utilisateurs</span>
          <span className="reg-stat-value">{stats.totalUsers}</span>
        </div>
        <div className="reg-stat-card">
          <span className="reg-stat-label">Total ambulances</span>
          <span className="reg-stat-value">{stats.totalAmbulances}</span>
        </div>
        <div className="reg-stat-card">
          <span className="reg-stat-label">Interventions actives</span>
          <span className="reg-stat-value">{stats.activeInterventions}</span>
        </div>
        <div className="reg-stat-card">
          <span className="reg-stat-label">Alertes aujourd'hui</span>
          <span className="reg-stat-value">{stats.alertsToday}</span>
        </div>
      </div>
    </>
  );
}
