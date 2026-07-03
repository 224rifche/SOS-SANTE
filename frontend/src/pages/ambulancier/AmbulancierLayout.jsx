import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/ambulancier.css";

const NAV_ITEMS = [
  {
    to: "/ambulancier",
    label: "Missions",
    end: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
  },
  {
    to: "/ambulancier/itineraire",
    label: "Navigation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
];

export default function AmbulancierLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isFullscreenView = location.pathname.includes("/itineraire")
    || location.pathname.includes("/prise-en-charge");

  const initials = user
    ? `${(user.firstName || "?")[0]}${(user.lastName || "?")[0]}`.toUpperCase()
    : "??";

  return (
    <div className="amb-layout">
      {!isFullscreenView && (
        <header className="amb-layout-header">
          <div className="amb-layout-brand">
            <div className="amb-layout-brand-icon">NE</div>
            <div>
              <span className="amb-layout-brand-name">Nhellan Emergency</span>
              <span className="amb-layout-brand-sub">Ambulancier</span>
            </div>
          </div>
          <div className="amb-layout-user">
            <span className="amb-layout-avatar">{initials}</span>
            <button type="button" className="amb-layout-logout" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </header>
      )}

      <main className={`amb-layout-main ${isFullscreenView ? "amb-layout-main--fullscreen" : ""}`}>
        <Outlet />
      </main>

      {!isFullscreenView && (
        <nav className="amb-layout-bottom-nav" aria-label="Navigation ambulancier">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `amb-layout-nav-item ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
