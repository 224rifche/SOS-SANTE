import { Routes, Route, Outlet } from "react-router-dom";
import DoctorDashboard from "../pages/doctor/doctordashboard";
import DoctorInterventionPage from "../pages/doctor/DoctorInterventionPage";
import DoctorLayout from "../pages/doctor/DoctorLayout";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import SOSPage from "../pages/citizen/SOSPage";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import CitizenLayout from "../pages/citizen/CitizenLayout";
import TrackingPage from "../pages/citizen/TrackingPage";
import AlertConfirmationPage from "../pages/citizen/AlertConfirmationPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CitizenProfilePage from "../pages/citizen/CitizenProfilePage";
import CitizenHistoryPage from "../pages/citizen/CitizenHistoryPage";
import AmbulancierDashboard from "../pages/ambulancier/AmbulancierDashboard";
import AmbulanceItinerary from "../pages/ambulancier/AmbulanceItinerary";
import AmbulanceMissionDetail from "../pages/ambulancier/AmbulanceMissionDetail";
import AmbulancePatientIntake from "../pages/ambulancier/AmbulancePatientIntake";
import AmbulancierLayout from "../pages/ambulancier/AmbulancierLayout";
import HomeRedirect from "./HomeRedirect";
import Navbar from "../components/layout/Navbar";
import AlertDetailPage from "../pages/medical-center/AlertDetailPage";
import AmbulanceAssignmentPage from "../pages/medical-center/AmbulanceAssignmentPage";
import InterventionTrackingPage from "../pages/medical-center/InterventionTrackingPage";
import RegulationLayout from "../pages/medical-center/RegulationLayout";
import RegulationDashboardPage from "../pages/medical-center/RegulationDashboardPage";
import RegulationAlertsPage from "../pages/medical-center/RegulationAlertsPage";
import RegulationMapPage from "../pages/medical-center/RegulationMapPage";
import RegulationAmbulancesPage from "../pages/medical-center/RegulationAmbulancesPage";
import RegulationDoctorsPage from "../pages/medical-center/RegulationDoctorsPage";
import RegulationHistoryPage from "../pages/medical-center/RegulationHistoryPage";
import RegulationStatsPage from "../pages/medical-center/RegulationStatsPage";

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
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]} />}>
          <Route element={<CitizenLayout />}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/alert" element={<SOSPage />} />
            <Route path="/citizen/alert/:alertId/confirmation" element={<AlertConfirmationPage />} />
            <Route path="/citizen/tracking/:alertId" element={<TrackingPage />} />
            <Route path="/citizen/profile" element={<CitizenProfilePage />} />
            <Route path="/citizen/history" element={<CitizenHistoryPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["AMBULANCIER", "ADMIN"]} />}>
          <Route element={<AmbulancierLayout />}>
            <Route path="/ambulancier" element={<AmbulancierDashboard />} />
            <Route path="/ambulancier/mission/:id" element={<AmbulanceMissionDetail />} />
            <Route path="/ambulancier/mission" element={<AmbulanceMissionDetail />} />
            <Route path="/ambulancier/mission/:id/prise-en-charge" element={<AmbulancePatientIntake />} />
            <Route path="/ambulancier/prise-en-charge" element={<AmbulancePatientIntake />} />
            <Route path="/ambulancier/itineraire" element={<AmbulanceItinerary />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]} />}>
          <Route element={<DoctorLayout />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/intervention/:id" element={<DoctorInterventionPage />} />
          </Route>
        </Route>

        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["MEDICAL_CENTER", "ADMIN"]} />}>
            <Route element={<RegulationLayout />}>
              <Route path="/medical-center" element={<RegulationDashboardPage />} />
              <Route path="/medical-center/alerts" element={<RegulationAlertsPage />} />
              <Route path="/medical-center/map" element={<RegulationMapPage />} />
              <Route path="/medical-center/ambulances" element={<RegulationAmbulancesPage />} />
              <Route path="/medical-center/doctors" element={<RegulationDoctorsPage />} />
              <Route path="/medical-center/history" element={<RegulationHistoryPage />} />
              <Route path="/medical-center/stats" element={<RegulationStatsPage />} />
            </Route>
            <Route path="/medical-center/alerts/:alertId" element={<AlertDetailPage />} />
            <Route path="/medical-center/alerts/:alertId/assign" element={<AmbulanceAssignmentPage />} />
            <Route path="/medical-center/alerts/:alertId/tracking" element={<InterventionTrackingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<div className="container py-5 text-center">Page introuvable</div>} />
    </Routes>
  );
}