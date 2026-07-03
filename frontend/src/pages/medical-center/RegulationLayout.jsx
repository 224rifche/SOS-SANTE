import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import { formatClock } from "./regulationUtils";
import {
  GridIcon, AlertIcon, MapIcon, AmbulanceIcon, DoctorIcon, HistoryIcon, StatsIcon, BellIcon,
} from "./regulationIcons";
import "../../styles/regulation.css";

const NAV_ITEMS = [
  { to: "/medical-center", label: "Tableau de bord", icon: <GridIcon />, end: true },
  { to: "/medical-center/alerts", label: "Alertes", icon: <AlertIcon /> },
  { to: "/medical-center/map", label: "Carte temps réel", icon: <MapIcon /> },
  { to: "/medical-center/ambulances", label: "Ambulances", icon: <AmbulanceIcon /> },
  { to: "/medical-center/doctors", label: "Médecins", icon: <DoctorIcon /> },
  { to: "/medical-center/history", label: "Historique", icon: <HistoryIcon /> },
  { to: "/medical-center/stats", label: "Statistiques", icon: <StatsIcon /> },
];

export default function RegulationLayout() {
  const { user } = useAuth();
  const { connected, subscribe } = useWebSocket();
  const [pendingCount, setPendingCount] = useState(0);
  const [time, setTime] = useState(formatClock());

  useEffect(() => {
    const timer = setInterval(() => setTime(formatClock()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshPendingCount = () => {
    alertService.listAll("EN_ATTENTE_VALIDATION")
      .then((list) => setPendingCount(list.length))
      .catch(() => {});
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  useEffect(() => {
    if (!connected) return undefined;
    const unsubscribe = subscribe("/topic/alerts", () => refreshPendingCount());
    return unsubscribe;
  }, [connected, subscribe]);

  const initials = user
    ? `${(user.firstName || "?")[0]}${(user.lastName || "?")[0]}`.toUpperCase()
    : "??";
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Régulateur";

  return (
    <div className="reg-app-wrapper">
      <aside className="reg-sidebar">
        <div className="reg-brand">
          <div className="reg-brand-icon">NE</div>
          <div>
            <span className="reg-brand-name">Nhellan Emergency</span>
            <span className="reg-brand-sub">Régulation</span>
          </div>
        </div>

        <span className="reg-nav-section-label">Régulation</span>
        <nav className="reg-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `reg-nav-item ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.to === "/medical-center/alerts" && pendingCount > 0 && (
                <span className="reg-nav-badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="reg-sidebar-profile">
          <div className="reg-profile-avatar">{initials}</div>
          <div>
            <span className="reg-profile-name">{fullName || "Régulateur"}</span>
            <span className="reg-profile-role">Régulateur(rice)</span>
          </div>
        </div>
      </aside>

      <div className="reg-main">
        <header className="reg-header">
          <div className="reg-header-title">
            <h1>
              Centre de régulation
              {pendingCount > 0 && (
                <span className="reg-pending-pill">
                  <span className="reg-dot" />
                  {pendingCount} alerte{pendingCount > 1 ? "s" : ""} en attente
                </span>
              )}
            </h1>
            <span className="reg-header-subtitle">{fullName || "Régulateur"}</span>
          </div>
          <div className="reg-header-right">
            <input className="reg-search-input" type="search" placeholder="Rechercher une alerte, une unité..." />
            <span className={`reg-ws-pill ${connected ? "connected" : "disconnected"}`}>
              <span className="reg-dot" />
              {connected ? "WebSocket actif" : "Hors ligne"}
            </span>
            <span className="reg-clock">{time}</span>
            <button className="reg-bell-btn" aria-label="Notifications" type="button">
              <BellIcon />
            </button>
          </div>
        </header>

        <div className="reg-content">
          <Outlet context={{ pendingCount, refreshPendingCount }} />
        </div>
      </div>
    </div>
  );
}
