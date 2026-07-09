import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { alertService } from "../../services/alertService";
import { Link, NavLink } from "react-router-dom";

const ROLE_NAV = {
  CITIZEN: [
    { to: "/citizen", label: "Accueil", end: true },
    { to: "/citizen/alert", label: "Alerte" },
    { to: "/citizen/history", label: "Historique" },
    { to: "/citizen/profile", label: "Profil" },
  ],
  MEDICAL_CENTER: [
    { to: "/medical-center", label: "Tableau de bord", end: true },
    { to: "/medical-center/alerts", label: "Alertes" },
    { to: "/medical-center/map", label: "Carte" },
  ],
  AMBULANCIER: [
    { to: "/ambulancier", label: "Missions", end: true },
  ],
  DOCTOR: [
    { to: "/doctor/dashboard", label: "Urgences", end: true },
  ],
  ADMIN: [
    { to: "/admin", label: "Administration", end: true },
  ],
};

function getNavItems(roles) {
  if (roles.includes("ADMIN")) return ROLE_NAV.ADMIN;
  if (roles.includes("MEDICAL_CENTER")) return ROLE_NAV.MEDICAL_CENTER;
  if (roles.includes("DOCTOR")) return ROLE_NAV.DOCTOR;
  if (roles.includes("AMBULANCIER")) return ROLE_NAV.AMBULANCIER;
  return ROLE_NAV.CITIZEN;
}

export const SIDEBAR_WIDTH = 240;

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { connected, subscribe } = useWebSocket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const roles = user?.roles || [];
  const isAdmin = roles.includes("ADMIN");

  const refreshPendingCount = () => {
    alertService.listAll("EN_ATTENTE_VALIDATION")
      .then((list) => setPendingCount(list.length))
      .catch(() => {});
  };

  useEffect(() => {
    if (!isAdmin || !isAuthenticated) return undefined;
    refreshPendingCount();
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    if (!isAdmin || !connected) return undefined;
    return subscribe("/topic/alerts", () => refreshPendingCount());
  }, [isAdmin, connected, subscribe]);

  if (!isAuthenticated) return null;

  const navItems = getNavItems(roles);
  const displayRole = roles[0] || "UTILISATEUR";
  const initials = user
    ? `${(user.firstName || "?")[0]}${(user.lastName || "?")[0]}`.toUpperCase()
    : "??";
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

  return (
    <>
      <style>{`
        .sidebar-nav {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: ${SIDEBAR_WIDTH}px;
          background: #0B1524;
          display: flex;
          flex-direction: column;
          z-index: 1030;
          transition: transform 0.2s ease;
          overflow-y: auto;
        }
        .sidebar-nav-toggle {
          display: none;
          position: fixed;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 1040;
        }
        .sidebar-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.9rem;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .sidebar-nav-link:hover {
          background-color: rgba(255,255,255,0.06);
          color: #fff;
        }
        .sidebar-nav-link.active {
          background-color: rgba(220,53,69,0.25);
          color: #fff;
          font-weight: 600;
        }
        .sidebar-nav-badge {
          background-color: #dc3545;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          line-height: 1.4;
        }
        .sidebar-nav-identity {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border-radius: 0.5rem;
          background-color: rgba(255,255,255,0.04);
        }
        .sidebar-nav-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(220,53,69,0.25);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .sidebar-nav-overlay {
          display: none;
        }
        @media (max-width: 991.98px) {
          .sidebar-nav {
            transform: translateX(${mobileOpen ? "0" : "-100%"});
          }
          .sidebar-nav-toggle {
            display: inline-flex;
          }
          .sidebar-nav-overlay {
            display: ${mobileOpen ? "block" : "none"};
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 1020;
          }
        }
      `}</style>

      <button
        type="button"
        className="btn btn-dark sidebar-nav-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Ouvrir le menu"
      >
        ☰
      </button>

      <div className="sidebar-nav-overlay" onClick={() => setMobileOpen(false)} />

      <nav className="sidebar-nav p-3">
        <Link className="d-flex align-items-center fw-bold text-white text-decoration-none mb-3" to="/">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-danger rounded-2 me-2 fw-bold small"
            style={{ width: "32px", height: "32px", flexShrink: 0 }}
          >
            NE
          </div>
          <span>
            Wonmally <span className="text-danger">Emergency</span>
          </span>
        </Link>

        <div className="sidebar-nav-identity">
          <div className="sidebar-nav-avatar">{initials}</div>
          <div className="text-truncate">
            <div className="text-white small text-truncate">{fullName || user?.email}</div>
            <span className="badge bg-secondary" style={{ fontSize: "0.65rem" }}>{displayRole}</span>
          </div>
        </div>

        <ul className="nav flex-column gap-1 flex-grow-1">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                {isAdmin && pendingCount > 0 && (
                  <span className="sidebar-nav-badge">{pendingCount}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="border-top border-secondary border-opacity-25 pt-3 mt-3">
          <div className="text-light small mb-2">
            <div className="text-truncate">{user?.email}</div>
          </div>
          <button className="btn btn-outline-danger btn-sm w-100" onClick={logout}>
            Deconnexion
          </button>
        </div>
      </nav>
    </>
  );
}