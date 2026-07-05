import { useAuth } from "../../contexts/AuthContext";
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
    { to: "/medical-center", label: "Regulation", end: true },
    { to: "/citizen", label: "Citoyen", end: true },
    { to: "/ambulancier", label: "Ambulancier", end: true },
    { to: "/doctor/dashboard", label: "Medecin", end: true },
  ],
};

function getNavItems(roles) {
  if (roles.includes("ADMIN")) return ROLE_NAV.ADMIN;
  if (roles.includes("MEDICAL_CENTER")) return ROLE_NAV.MEDICAL_CENTER;
  if (roles.includes("DOCTOR")) return ROLE_NAV.DOCTOR;
  if (roles.includes("AMBULANCIER")) return ROLE_NAV.AMBULANCIER;
  return ROLE_NAV.CITIZEN;
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  const roles = user?.roles || [];
  const navItems = getNavItems(roles);
  const displayRole = roles[0] || "UTILISATEUR";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3 mb-4" style={{ background: "#0B1524" }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold text-white" to="/">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-danger rounded-2 me-2 fw-bold small"
            style={{ width: "32px", height: "32px" }}
          >
            NE
          </div>
          <span>
            Wonmally <span className="text-danger">Emergency</span>
          </span>
        </Link>
        <div className="collapse navbar-collapse show" id="navbarNav">
          <ul className="navbar-nav me-auto gap-1 flex-wrap">
            {navItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-link px-3 rounded-3 ${isActive ? "active bg-danger bg-opacity-25 text-white" : "text-white-50"}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="text-light small d-none d-sm-inline">
              {user?.email}{" "}
              <span className="badge bg-secondary ms-1">{displayRole}</span>
            </span>
            <button className="btn btn-outline-danger btn-sm px-3" onClick={logout}>
              Deconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}