import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/citizen.css";

const NAV = [
  { to: "/citizen", label: "Accueil", end: true, icon: "🏠" },
  { to: "/citizen/history", label: "Historique", icon: "📋" },
  { to: "/citizen/profile", label: "Profil", icon: "👤" },
];

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isSosFlow = location.pathname.includes("/alert")
    || location.pathname.includes("/tracking/");

  const firstName = user?.firstName || "Citoyen";

  return (
    <div className="cit-layout">
      {!isSosFlow && (
        <header className="cit-layout-header">
          <div className="cit-layout-brand">
            <div className="cit-layout-brand-left">
              <div className="cit-layout-brand-icon">NE</div>
              <div>
                <span className="cit-layout-brand-name">Nhellan Emergency</span>
                <span className="cit-layout-brand-sub">Espace citoyen</span>
              </div>
            </div>
            <button type="button" className="cit-layout-logout" onClick={logout}>
              Déconnexion
            </button>
          </div>
          {location.pathname === "/citizen" && (
            <div className="cit-layout-greeting">
              <h1>Bonjour, {firstName}</h1>
              <p>Votre sécurité est notre priorité. Un geste suffit pour alerter les secours.</p>
            </div>
          )}
        </header>
      )}

      <main className={`cit-layout-main ${location.pathname.includes("/sos") ? "cit-layout-main--sos" : ""}`}>
        <Outlet />
      </main>

      {!isSosFlow && (
        <nav className="cit-layout-bottom-nav" aria-label="Navigation citoyen">
          {NAV.slice(0, 1).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `cit-nav-item ${isActive ? "active" : ""}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="cit-nav-item cit-nav-item--sos">
            <NavLink to="/citizen/alert" className="cit-nav-sos-btn" aria-label="Alerte Urgence">
              SOS
            </NavLink>
          </div>
          {NAV.slice(1).map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `cit-nav-item ${isActive ? "active" : ""}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
