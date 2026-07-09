import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import WelcomePage from "../pages/welcome/WelcomePage";

/**
 * Route de redirection intelligente a l'atterrissage sur la racine (/).
 * Public si non connecte (WelcomePage), sinon oriente chaque utilisateur
 * vers son dashboard dedie selon son role.
 */
export default function HomeRedirect() {
  const { isAuthenticated, hasRole, authChecked } = useAuth();

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  if (hasRole("ADMIN")) {
    return <Navigate to="/admin" replace />;
  }
  if (hasRole("MEDICAL_CENTER")) {
    return <Navigate to="/medical-center" replace />;
  }
  if (hasRole("DOCTOR")) {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  if (hasRole("AMBULANCIER")) {
    return <Navigate to="/ambulancier" replace />;
  }

  return <Navigate to="/citizen" replace />;
}
