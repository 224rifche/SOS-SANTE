import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";

const STATUS_COLORS = {
  EN_ATTENTE_VALIDATION: "#F59E0B",
  VALIDEE: "#10B981",
  REJETEE: "#EF4444",
  INTERVENTION_CLOTUREE: "#6B7280",
  ARCHIVEE: "#1F2937",
  AVAILABLE: "#10B981",
  EN_ROUTE: "#3B82F6",
  ON_MISSION: "#F59E0B",
  MAINTENANCE: "#6B7280",
  OUT_OF_SERVICE: "#EF4444",
};

function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="card border-0 shadow-sm rounded-4 p-4 h-100"
      style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "default" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>{label}</span>
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: "36px", height: "36px", background: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="fs-2 fw-bold mb-0" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function StatusBarChart({ title, data }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
      <p className="fw-bold mb-4">{title}</p>
      <div className="d-flex flex-column gap-3">
        {entries.map(([status, count]) => {
          const color = STATUS_COLORS[status] || "#6B7280";
          const widthPct = (count / max) * 100;
          return (
            <div key={status}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small fw-semibold" style={{ color }}>{status.replace(/_/g, " ")}</span>
                <span className="small fw-bold">{count}</span>
              </div>
              <div className="rounded-pill" style={{ background: "#F1F3F5", height: "8px", overflow: "hidden" }}>
                <div
                  className="rounded-pill"
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: color,
                    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dashboardService.getStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || "Impossible de charger les statistiques."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon="🚨" label="Alertes totales" value={stats.totalAlerts} accent="#EF4444" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="📅" label="Aujourd'hui" value={stats.alertsToday} accent="#F59E0B" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="🚑" label="Ambulances" value={stats.totalAmbulances} accent="#3B82F6" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="⚡" label="Interventions actives" value={stats.activeInterventions} accent="#10B981" />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <StatusBarChart title="Alertes par statut" data={stats.alertsByStatus} />
        </div>
        <div className="col-12 col-lg-6">
          <StatusBarChart title="Ambulances par statut" data={stats.ambulancesByStatus} />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <p className="fw-bold mb-4">Utilisateurs par role <span className="text-secondary fw-normal">({stats.totalUsers} au total)</span></p>
        <div className="row g-3">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role} className="col-6 col-md-2-4" style={{ flex: "1 1 18%" }}>
              <div className="text-center p-3 rounded-4" style={{ background: "#F8F9FA" }}>
                <p className="fs-3 fw-bold mb-0 text-primary">{count}</p>
                <p className="text-secondary small mb-0 text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}