import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import logo from "../../assets/logo-wonmally.png";
import "../../styles/admin.css";

const NAV_ITEMS = [
  { to: "/admin/overview", label: "Vue d'ensemble", icon: "📊" },
  { to: "/admin/regulation", label: "Régulation", icon: "🚨", showBadge: true },
  { to: "/admin/doctors", label: "Médecins", icon: "🩺" },
  { to: "/admin/ambulances", label: "Vehicules", icon: "🚑" },
  { to: "/admin/ambulanciers", label: "Ambulanciers", icon: "🧑‍🚒" },
  { to: "/admin/citizens", label: "Citoyens", icon: "👤" },
  { to: "/admin/users", label: "Utilisateurs", icon: "⚙️" },
  { to: "/admin/audit", label: "Journal d'audit", icon: "📜" },
];

const PAGE_TITLES = {
  "/admin/overview": "Vue d'ensemble",
  "/admin/regulation": "Supervision — Régulation",
  "/admin/doctors": "Supervision — Médecins",
  "/admin/ambulances": "Supervision — Vehicules",
  "/admin/ambulanciers": "Supervision — Ambulanciers",
  "/admin/citizens": "Supervision — Citoyens",
  "/admin/users": "Gestion des utilisateurs",
  "/admin/audit": "Journal d'audit",
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { connected, subscribe } = useWebSocket();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const refreshPendingCount = () => {
    alertService.listAll("EN_ATTENTE_VALIDATION")
      .then((list) => setPendingCount(list.length))
      .catch(() => { });
  };

  useEffect(() => { refreshPendingCount(); }, []);

  useEffect(() => {
    if (!connected) return undefined;
    return subscribe("/topic/alerts", () => refreshPendingCount());
  }, [connected, subscribe]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = user
    ? `${(user.firstName || "?")[0]}${(user.lastName || "?")[0]}`.toUpperCase()
    : "??";
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const pageTitle = PAGE_TITLES[location.pathname] || "Administration";

  return (
    <div className="admin-shell">
      {!mobileOpen && (
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      )}

      {mobileOpen && <div className="admin-sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-logo-box">
            <img src={logo} alt="Wonmally" />
          </div>
          <span className="admin-brand-name">
            Wonmally
          </span>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <div className="admin-identity">
          <div className="admin-avatar">{initials}</div>
          <div className="admin-identity-text">
            <div className="admin-identity-name">{fullName || user?.email}</div>
            <span className="admin-role-badge">ADMIN</span>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
              {item.showBadge && pendingCount > 0 && (
                <span className="admin-nav-badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className={`admin-status-pill ${connected ? "online" : "offline"}`}>
            <span className="admin-status-dot" />
            {connected ? "Temps réel actif" : "Hors ligne"}
          </div>
          <button type="button" className="admin-logout-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">{pageTitle}</h1>
          <span className="admin-topbar-email">{user?.email}</span>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}