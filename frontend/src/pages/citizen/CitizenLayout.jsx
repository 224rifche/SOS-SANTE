import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { alertService } from "../../services/alertService";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo-wonmally.png";
import "../../styles/citizen.css";

const NAV = [
  { to: "/citizen", label: "Accueil", end: true, icon: "🏠" },
  { to: "/citizen/history", label: "Historique", icon: "📋" },
  { to: "/citizen/profile", label: "Profil", icon: "👤" },
];

export default function CitizenLayout() {
  const { user, logout, hasRole } = useAuth();

  useEffect(() => {
    const trySync = async () => {
      const count = alertService.getPendingAlertsCount();
      if (count === 0) return;
      const result = await alertService.flushPendingAlerts();
      if (result.sent > 0) {
        toast.success(`${result.sent} alerte(s) en attente envoyee(s) avec succes.`);
      }
    };
    trySync();
    window.addEventListener("online", trySync);
    return () => window.removeEventListener("online", trySync);
  }, []);
  const location = useLocation();
  const isSosFlow = location.pathname.includes("/alert")
    || location.pathname.includes("/tracking/");
  const isAdmin = hasRole("ADMIN");

  const firstName = user?.firstName || "Citoyen";
  const roleLabel = isAdmin ? "Administration - Vue Citoyen" : "Espace citoyen";
  const greeting = isAdmin 
    ? `Vue citoyen - ${firstName}`
    : `Bonjour, ${firstName}`;
  const subText = isAdmin 
    ? "Accès administrateur à l'espace citoyen"
    : "Votre sécurité est notre priorité. Un geste suffit pour alerter les secours.";

  return (
    <div className="cit-layout">
      {!isSosFlow && (
        <header className="cit-layout-header">
          <div className="cit-layout-brand">
            <div className="cit-layout-brand-left">
              <img src={logo} alt="Wonmally Logo" className="cit-layout-brand-logo" />
              <div>
                <span className="cit-layout-brand-name">Wonmally</span>
                <span className="cit-layout-brand-sub">{roleLabel}</span>
              </div>
            </div>
            <button type="button" className="cit-layout-logout" onClick={logout}>
              Déconnexion
            </button>
          </div>
          {location.pathname === "/citizen" && (
            <div className="cit-layout-greeting">
              <h1>{greeting}</h1>
              <p>{subText}</p>
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
