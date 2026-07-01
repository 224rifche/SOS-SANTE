import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SOSPage from "../pages/citizen/SOSPage";

/**
 * Route de redirection intelligente a l'atterrissage sur la racine (/).
 * Evite les boucles de redirection et oriente chaque utilisateur vers son dashboard dedie.
 */
export default function HomeRedirect() {
  const { hasRole } = useAuth();

  if (hasRole("ADMIN")) {
    return <Navigate to="/admin" replace />;
  }
  if (hasRole("MEDICAL_CENTER")) {
    return <Navigate to="/medical-center" replace />;
  }
  if (hasRole("DOCTOR")) {
    return <Navigate to="/doctor" replace />;
  }
  if (hasRole("AMBULANCIER")) {
    return <Navigate to="/ambulancier" replace />;
  }
  
  // Par defaut, le Citoyen (ou si aucun autre role specifique n'est attribue)
  return <SOSPage />;
}
