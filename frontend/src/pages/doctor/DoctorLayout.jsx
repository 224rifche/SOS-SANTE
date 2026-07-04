import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo-wonmally.png";
import "../../styles/doctor.css";

export default function DoctorLayout() {
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");

  const roleLabel = isAdmin ? "Administration - Vue Médecin" : `Médecin — Dr. ${user?.lastName || ""}`;

  return (
    <div className="doc-layout">
      <header className="doc-layout-header">
        <div className="doc-layout-brand">
          <img src={logo} alt="Wonmally Logo" className="doc-layout-brand-logo" />
          <div>
            <div className="fw-bold">Wonmally</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.75 }}>{roleLabel}</div>
          </div>
        </div>
        <button type="button" className="btn btn-sm btn-outline-light" onClick={logout}>
          Déconnexion
        </button>
      </header>
      <main className="doc-layout-main">
        <Outlet />
      </main>
    </div>
  );
}
