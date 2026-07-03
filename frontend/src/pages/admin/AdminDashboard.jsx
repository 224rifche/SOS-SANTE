import { useState } from "react";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import AuditTab from "./AuditTab";

const TABS = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "users", label: "Utilisateurs" },
  { key: "audit", label: "Journal d'audit" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container-fluid py-4 px-4">
      <h1 className="fs-4 fw-bold mb-4">Tableau de bord Administrateur</h1>

      <ul className="nav nav-tabs mb-4">
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

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "audit" && <AuditTab />}
    </div>
  );
}