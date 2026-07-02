import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SOSPage from "../pages/citizen/SOSPage";
import MedicalCenterDashboard from "../pages/medical-center/MedicalCenterDashboard";
import AlertDetailPage from "../pages/medical-center/AlertDetailPage";
import AmbulanceAssignmentPage from "../pages/medical-center/AmbulanceAssignmentPage";
import InterventionTrackingPage from "../pages/medical-center/InterventionTrackingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]} />}>
        <Route path="/" element={<SOSPage />} />
        <Route path="/citizen/tracking/:alertId" element={<div>Suivi de l'intervention (a implementer)</div>} />
      </Route>

      {/* Route de test publique temporaire */}
      <Route path="/medical-center" element={<MedicalCenterDashboard />} />
      <Route path="/medical-center/alerts/:alertId" element={<AlertDetailPage />} />
      <Route path="/medical-center/alerts/:alertId/assign" element={<AmbulanceAssignmentPage />} />
      <Route path="/medical-center/alerts/:alertId/tracking" element={<InterventionTrackingPage />} />

      <Route element={<ProtectedRoute allowedRoles={["AMBULANCIER", "ADMIN"]} />}>
        <Route path="/ambulancier" element={<div>Tableau de bord Ambulancier (a implementer)</div>} />
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
