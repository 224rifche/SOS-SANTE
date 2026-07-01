import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SOSPage from "../pages/citizen/SOSPage";
import AmbulancierDashboard from "../pages/ambulancier/AmbulancierDashboard";
import AmbulanceItinerary from "../pages/ambulancier/AmbulanceItinerary";
import AmbulanceMissionDetail from "../pages/ambulancier/AmbulanceMissionDetail";
import AmbulancePatientIntake from "../pages/ambulancier/AmbulancePatientIntake";
import { useAuth } from "../contexts/AuthContext";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles.includes("AMBULANCIER")) return <Navigate to="/ambulancier" replace />;
  if (user.roles.includes("MEDICAL_CENTER")) return <Navigate to="/medical-center" replace />;
  if (user.roles.includes("DOCTOR")) return <Navigate to="/doctor" replace />;
  if (user.roles.includes("ADMIN")) return <Navigate to="/admin" replace />;
  return <Navigate to="/citizen" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dev/mission" element={<AmbulanceMissionDetail />} />
      <Route path="/dev/itineraire" element={<AmbulanceItinerary />} />
      <Route path="/dev/prise-en-charge" element={<AmbulancePatientIntake />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]} />}>
        <Route path="/citizen" element={<SOSPage />} />
        <Route path="/citizen/tracking/:alertId" element={<div>Suivi de l'intervention (a implementer)</div>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["MEDICAL_CENTER", "ADMIN"]} />}>
        <Route path="/medical-center" element={<div>Tableau de bord Centre Medical (a implementer)</div>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["AMBULANCIER", "ADMIN"]} />}>
        <Route path="/ambulancier" element={<AmbulancierDashboard />} />
        <Route path="/ambulancier/mission/:id" element={<AmbulanceMissionDetail />} />
        <Route path="/ambulancier/mission" element={<AmbulanceMissionDetail />} />
        <Route path="/ambulancier/mission/:id/prise-en-charge" element={<AmbulancePatientIntake />} />
        <Route path="/ambulancier/prise-en-charge" element={<AmbulancePatientIntake />} />
        <Route path="/ambulancier/itineraire" element={<AmbulanceItinerary />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]} />}>
        <Route path="/doctor" element={<div>Tableau de bord Medecin (a implementer)</div>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<div>Tableau de bord Administrateur (a implementer)</div>} />
      </Route>

      <Route path="*" element={<div>Page introuvable</div>} />
    </Routes>
  );
}
