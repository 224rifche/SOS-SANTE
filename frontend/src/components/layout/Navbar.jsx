import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

/**
 * Barre de navigation globale pour les utilisateurs connectes.
 * Affiche l'identite de l'utilisateur, son role et un bouton de deconnexion.
 */
export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  // Formate le role pour l'affichage
  const displayRole = user?.roles?.[0] || "UTILISATEUR";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3 mb-4">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold text-danger" to="/">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-heart-pulse-fill me-2" viewBox="0 0 16 16">
            <path d="M1.475 9c.085.302.263.58.53.754l.003.002 4.795 3.197a1 1 0 0 0 1.114 0l4.794-3.197c.27-.174.448-.452.533-.754H1.475ZM0 8a1.5 1.5 0 0 1 .728-1.286l.007-.005 5.9-3.933a1.5 1.5 0 0 1 1.662 0l5.9 3.933.007.005A1.5 1.5 0 0 1 16 8H0Zm5.443-4.757a.5.5 0 0 0-.586.378l-1.05 4.2H.5a.5.5 0 0 0 0 1h3.75a.5.5 0 0 0 .485-.378l.78-3.12 1.345 5.38a.5.5 0 0 0 .97.003l1.11-4.44 1.162 2.324a.5.5 0 0 0 .893.006L12 6.4h3.5a.5.5 0 0 0 0-1H11.5a.5.5 0 0 0-.447.276L10.3 7.15l-1.42-2.84a.5.5 0 0 0-.904-.038L6.87 8.71 5.443 3.243Z"/>
          </svg>
          Won-Mally
        </Link>
        
        <div className="collapse navbar-collapse show" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Emplacement pour de futurs liens de navigation */}
          </ul>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="text-light small d-none d-sm-inline">
              {user?.email} <span className="badge bg-secondary ms-1">{displayRole}</span>
            </span>
            <button className="btn btn-outline-danger btn-sm px-3" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
