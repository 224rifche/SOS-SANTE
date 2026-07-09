import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import { formatClock } from "./regulationUtils";
import logo from "../../assets/logo-wonmally.png";
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
  const { user, logout, hasRole } = useAuth();
  const { connected, subscribe } = useWebSocket();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [time, setTime] = useState(formatClock());
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = hasRole("ADMIN");

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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = user
    ? `${(user.firstName || "?")[0]}${(user.lastName || "?")[0]}`.toUpperCase()
    : "??";
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Régulateur";
  const roleLabel = isAdmin ? "Administration - Vue Régulation" : "Régulation";
  const profileRole = isAdmin ? "Administrateur" : "Régulateur(rice)";

  return (
    <div className="reg-app-wrapper">
      {!mobileOpen && (
        <button
          type="button"
          className="reg-mobile-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      )}

      {mobileOpen && <div className="reg-sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`reg-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="reg-brand">
          <img src={logo} alt="Wonmally Logo" className="reg-brand-logo" />
          <div>
            <span className="reg-brand-name">Wonmally</span>
            <span className="reg-brand-sub">{roleLabel}</span>
          </div>
          <button
            type="button"
            className="reg-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
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
          <div className="reg-profile-info">
            <div className="reg-profile-avatar">{initials}</div>
            <div>
              <span className="reg-profile-name">{fullName || "Régulateur"}</span>
              <span className="reg-profile-role">{profileRole}</span>
            </div>
          </div>
          <button type="button" className="reg-logout-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="reg-main">
        <header className="reg-header">
          <div className="reg-header-title">
            <h1>
              Centre de régulation
              {isAdmin && <span className="badge bg-primary ms-2">Vue Admin</span>}
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
