import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-wonmally.png";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import AuditTab from "./AuditTab";

const TABS = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "users", label: "Utilisateurs" },
  { key: "audit", label: "Journal d'audit" },
];

const NAVIGATION_SECTIONS = [
  {
    title: "Espace Citoyen",
    icon: "👤",
    color: "primary",
    routes: [
      { path: "/citizen", label: "Dashboard Citoyen", description: "Vue d'ensemble citoyen" },
      { path: "/citizen/alert", label: "Créer une alerte SOS", description: "Nouvelle urgence" },
      { path: "/citizen/history", label: "Historique des alertes", description: "Historique personnel" },
      { path: "/citizen/profile", label: "Profil", description: "Gestion du profil" },
    ],
  },
  {
    title: "Espace Ambulancier",
    icon: "🚑",
    color: "success",
    routes: [
      { path: "/ambulancier", label: "Dashboard Ambulancier", description: "Vue ambulancier" },
      { path: "/ambulancier/itineraire", label: "Itinéraire", description: "Navigation GPS" },
      { path: "/ambulancier/mission", label: "Mission en cours", description: "Détails mission" },
    ],
  },
  {
    title: "Espace Médecin",
    icon: "👨‍⚕️",
    color: "info",
    routes: [
      { path: "/doctor", label: "Dashboard Médecin", description: "Vue médecin" },
      { path: "/doctor/dashboard", label: "Interventions", description: "Liste interventions" },
    ],
  },
  {
    title: "Centre Médical",
    icon: "🏥",
    color: "warning",
    routes: [
      { path: "/medical-center", label: "Dashboard Régulation", description: "Centre de régulation" },
      { path: "/medical-center/alerts", label: "Alertes", description: "Gestion des alertes" },
      { path: "/medical-center/map", label: "Carte", description: "Vue cartographique" },
      { path: "/medical-center/ambulances", label: "Ambulances", description: "Flotte ambulances" },
      { path: "/medical-center/doctors", label: "Médecins", description: "Équipe médicale" },
      { path: "/medical-center/history", label: "Historique", description: "Historique interventions" },
      { path: "/medical-center/stats", label: "Statistiques", description: "Statistiques" },
    ],
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container-fluid py-4 px-4" style={{ maxWidth: "1600px", margin: "0 auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <img src={logo} alt="Wonmally Logo" style={{ width: "50px", height: "50px", borderRadius: "8px" }} />
          <div>
            <h1 className="fs-3 fw-bold mb-1">Tableau de bord Administrateur</h1>
            <p className="text-muted mb-0">Wonmally - Accès complet à tous les espaces de l'application</p>
          </div>
        </div>
        <span className="badge bg-primary fs-6">Accès complet</span>
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold border-0 pb-0">
              <h5 className="mb-0">Navigation Rapide</h5>
            </div>
            <div className="card-body p-3">
              {NAVIGATION_SECTIONS.map((section) => (
                <div key={section.title} className="mb-4">
                  <div className="small text-muted fw-semibold mb-2 px-2 d-flex align-items-center gap-2">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </div>
                  <div className="bg-light rounded p-2">
                    {section.routes.map((route) => (
                      <Link
                        key={route.path}
                        to={route.path}
                        className="d-block px-2 py-2 text-decoration-none text-dark hover-bg-light rounded mb-1"
                        style={{ fontSize: "0.875rem" }}
                      >
                        <div className="fw-medium">{route.label}</div>
                        <div className="small text-muted" style={{ fontSize: "0.75rem" }}>{route.description}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-0">
              <ul className="nav nav-tabs card-header-tabs">
                {TABS.map((tab) => (
                  <li className="nav-item" key={tab.key}>
                    <button
                      type="button"
                      className={`nav-link ${activeTab === tab.key ? "active fw-semibold" : ""}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-body">
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "users" && <UsersTab />}
              {activeTab === "audit" && <AuditTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}