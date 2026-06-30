import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Protege une route : redirige vers /login si non authentifie,
 * et controle l'acces selon le role (RBAC) si allowedRoles est fourni.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
