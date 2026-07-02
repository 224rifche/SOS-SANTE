import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SOSPage from "../pages/citizen/SOSPage";
import Screen1_Dashboard from "../pages/admin/Screen1_Dashboard";
import Screen2_Utilisateurs from "../pages/admin/Screen2_Utilisateurs";
import Screen3_Statistiques from "../pages/admin/Screen3_Statistiques";
import Screen4_JournalAudit from "../pages/admin/Screen4_JournalAudit";
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

      {/* Routes protégées avec barre de navigation globale */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/citizen/tracking/:alertId" element={<div>Suivi de l'intervention (a implementer)</div>} />

          <Route element={<ProtectedRoute allowedRoles={["MEDICAL_CENTER", "ADMIN"]} />}>
            <Route path="/medical-center" element={<div>Tableau de bord Centre Medical (a implementer)</div>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["AMBULANCIER", "ADMIN"]} />}>
            <Route path="/ambulancier" element={<div>Tableau de bord Ambulancier (a implementer)</div>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]} />}>
            <Route path="/doctor" element={<div>Tableau de bord Medecin (a implementer)</div>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<Screen1_Dashboard />} />
            <Route path="/admin/users" element={<Screen2_Utilisateurs />} />
            <Route path="/admin/statistics" element={<Screen3_Statistiques />} />
            <Route path="/admin/audit" element={<Screen4_JournalAudit />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<div>Page introuvable</div>} />
    </Routes>
  );
}
