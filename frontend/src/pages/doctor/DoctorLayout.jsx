import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/doctor.css";

export default function DoctorLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="doc-layout">
      <header className="doc-layout-header">
        <div className="doc-layout-brand">
          <div className="doc-layout-brand-icon">NE</div>
          <div>
            <div className="fw-bold">Nhellan Emergency</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.75 }}>Médecin — Dr. {user?.lastName || ""}</div>
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
