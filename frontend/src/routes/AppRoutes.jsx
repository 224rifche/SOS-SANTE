import { Routes, Route, Outlet } from "react-router-dom";
import DoctorDashboard from "../pages/doctor/doctordashboard";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SOSPage from "../pages/citizen/SOSPage";
import AmbulancierDashboard from "../pages/ambulancier/AmbulancierDashboard";
import AmbulanceItinerary from "../pages/ambulancier/AmbulanceItinerary";
import AmbulanceMissionDetail from "../pages/ambulancier/AmbulanceMissionDetail";
import AmbulancePatientIntake from "../pages/ambulancier/AmbulancePatientIntake";
import HomeRedirect from "./HomeRedirect";
import Navbar from "../components/layout/Navbar";

function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="container-fluid px-0">
        <Outlet />
      </div>
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route path="/" element={<HomeRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]} />}>
            <Route path="/citizen" element={<SOSPage />} />
            <Route
              path="/citizen/tracking/:alertId"
              element={<div>Suivi de l'intervention (a implementer)</div>}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["MEDICAL_CENTER", "ADMIN"]} />}>
            <Route
              path="/medical-center"
              element={<div>Tableau de bord Centre Medical (a implementer)</div>}
            />
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
            <Route
              path="/doctor"
              element={<div>Tableau de bord Medecin (a implementer)</div>}
            />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={<div>Tableau de bord Administrateur (a implementer)</div>}
            />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<div>Page introuvable</div>} />
    </Routes>
  );
}