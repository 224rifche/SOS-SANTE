import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icônes SVG Inline pour éviter les dépendances externes et garantir un rendu parfait
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <path d="M12 5.67v10" opacity="0.3" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const LungsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
    <path d="M12 3v17" strokeWidth="1.5" />
    <path d="M12 8c-1.5-2.5-4-3-6.5-2.5A4.5 4.5 0 0 0 1 10c0 4.5 2.5 7 5.5 8h4.5c.6 0 1-.4 1-1V9" />
    <path d="M12 8c1.5-2.5 4-3 6.5-2.5A4.5 4.5 0 0 1 23 10c0 4.5-2.5 7-5.5 8h-4.5c-.6 0-1-.4-1-1V9" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-menu-icon">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ResourceIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-menu-icon">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-menu-icon">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function MedicalCenterDashboard() {
  // Navigation active tab: 'dashboard' | 'resources' | 'analytics'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showLabel, setShowLabel] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState("idle"); // idle | dispatching | success
  const [assignedAmbulance, setAssignedAmbulance] = useState("");
  const [animateChart, setAnimateChart] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Déclencher l'animation des graphiques à l'activation de l'onglet analytique
  useEffect(() => {
    if (activeTab === "analytics") {
      setAnimateChart(false);
      const timer = setTimeout(() => setAnimateChart(true), 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Sélection automatique de la première alerte sur grand écran par défaut
  useEffect(() => {
    if (activeTab === "dashboard" && !selectedAlert && window.innerWidth > 900) {
      setSelectedAlert(mockAlerts[0]);
    }
  }, [activeTab]);

  // Mock Alertes
  const mockAlerts = [
    {
      id: "alert-1",
      title: "Malaise cardiaque",
      address: "Hippodrome - #NE-2481",
      time: "Il y a 1 min",
      urgency: "high",
      icon: <HeartIcon />,
      caller: "Modibo Keita",
      phone: "+223 76 54 32 10",
      description: "Douleur oppressive retrosternale irradiant dans le bras gauche. Le patient de 62 ans est moite, pâle et présente des difficultés respiratoires aiguës.",
      location: "12.6514° N, 7.9892° W"
    },
    {
      id: "alert-2",
      title: "Accident de la route",
      address: "Route de Koulikoro - #NE-2479",
      time: "4 min",
      urgency: "medium",
      icon: <CarIcon />,
      caller: "Fatoumata Diallo",
      phone: "+223 66 12 34 56",
      description: "Collision entre un minibus SOTRAMA et un deux-roues. Le conducteur de la moto est au sol, conscient mais se plaint de vives douleurs au membre inférieur droit.",
      location: "12.6685° N, 7.9622° W"
    },
    {
      id: "alert-3",
      title: "Détresse respiratoire",
      address: "Badalabougou - #NE-2477",
      time: "8 min",
      urgency: "medium",
      icon: <LungsIcon />,
      caller: "Amadou Touré",
      phone: "+223 82 89 45 67",
      description: "Patient de 8 ans présentant une crise d'asthme sévère, ne répondant plus à la ventoline. Cyanose labiale légère constatée par le père.",
      location: "12.6189° N, 8.0125° W"
    }
  ];

  // Mock Ambulances
  const mockAmbulances = [
    { id: "amb-1", name: "Ambulance A1 - Bamako", status: "Disponible", type: "Type B (Médicalisée)", phone: "+223 70 01 02 03" },
    { id: "amb-2", name: "Ambulance A2 - Commune VI", status: "En intervention", type: "Type A (Secours)", phone: "+223 70 04 05 06" },
    { id: "amb-3", name: "Ambulance A3 - Hamdallaye", status: "Disponible", type: "Type B (Médicalisée)", phone: "+223 70 07 08 09" },
    { id: "amb-4", name: "Ambulance A4 - Badalabougou", status: "Disponible", type: "Type A (Secours)", phone: "+223 70 10 11 12" }
  ];

  // Mock Médecins
  const mockDoctors = [
    { id: "doc-1", name: "Dr. Alou Sangaré", status: "Disponible", specialty: "Urgentiste / Réanimateur", phone: "+223 60 11 22 33" },
    { id: "doc-2", name: "Dr. Mariam Traoré", status: "Disponible", specialty: "Médecine d'urgence", phone: "+223 60 44 55 66" },
    { id: "doc-3", name: "Dr. Cheick O. Doumbia", status: "En intervention", specialty: "Traumatologue", phone: "+223 60 77 88 99" },
    { id: "doc-4", name: "Dr. Fanta Coulibaly", status: "Disponible", specialty: "Pédiatrie d'urgence", phone: "+223 60 12 34 56" }
  ];

  // Déclencher l'animation d'affectation
  const handleAssignAmbulance = (ambName) => {
    setAssignedAmbulance(ambName);
    setDispatchStatus("dispatching");
    
    setTimeout(() => {
      setDispatchStatus("success");
      setTimeout(() => {
        setDispatchStatus("idle");
        // On ferme le modal mobile si applicable, sur desktop on garde l'alerte sélectionnée
        if (window.innerWidth <= 900) {
          setSelectedAlert(null);
        }
      }, 1500);
    }, 1800);
  };

  // Contenu détaillé de l'alerte (Partagé entre le panneau desktop et le tiroir mobile)
  const renderAlertDetailsContent = () => {
    if (!selectedAlert) return null;
    return (
      <div className="detail-panel-container">
        {dispatchStatus === "idle" && (
          <>
            <div className="drawer-badge-row">
              <span className="badge-critique" style={{
                backgroundColor: selectedAlert.urgency === "high" ? "#fee2e2" : "#ffedd5",
                color: selectedAlert.urgency === "high" ? "#ef4444" : "#ea580c"
              }}>
                {selectedAlert.urgency === "high" ? "Priorité Absolue" : "Priorité Moyenne"}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--color-dashboard-text-muted)" }}>
                Reçu {selectedAlert.time}
              </span>
              <Link to={`/medical-center/alerts/${selectedAlert.id}`} style={{ fontSize: "0.78rem", color: "var(--color-dashboard-blue)", fontWeight: 600, marginLeft: "auto", textDecoration: "none" }}>
                Plein écran ↗
              </Link>
            </div>

            <div className="map-mockup-wrapper">
              <div className="map-grid-lines"></div>
              <div className="map-street-h"></div>
              <div className="map-street-v"></div>
              <div className="map-target-dot"></div>
            </div>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-icon-box">👤</span>
                <div className="detail-text-box">
                  <span className="detail-lbl">Patient / Demandeur</span>
                  <span className="detail-val">{selectedAlert.caller} • {selectedAlert.phone}</span>
                </div>
              </div>

              <div className="detail-info-item">
                <span className="detail-icon-box">📍</span>
                <div className="detail-text-box">
                  <span className="detail-lbl">Localisation GPS</span>
                  <span className="detail-val">{selectedAlert.location}</span>
                </div>
              </div>

              <div className="detail-info-item">
                <span className="detail-icon-box">📝</span>
                <div className="detail-text-box">
                  <span className="detail-lbl">Détails de l'incident</span>
                  <span className="detail-val detail-desc-box">{selectedAlert.description}</span>
                </div>
              </div>
            </div>

            {/* Actions d'affectation */}
            <div className="desktop-dispatch-box">
              <span className="dispatch-selector-title">Déployer un véhicule disponible :</span>
              <div className="dispatch-options-list">
                {mockAmbulances.filter(a => a.status === "Disponible").map((amb) => (
                  <div 
                    key={amb.id} 
                    className="dispatch-option-row"
                    onClick={() => handleAssignAmbulance(amb.name)}
                  >
                    <span>🚑 {amb.name}</span>
                    <span style={{ color: "var(--color-dashboard-blue)", fontWeight: 600 }}>Déployer ›</span>
                  </div>
                ))}
              </div>
              <button 
                className="dispatch-btn-primary"
                onClick={() => handleAssignAmbulance("Ambulance A1 - Bamako")}
              >
                🚨 Réponse Rapide Automatique
              </button>
            </div>
          </>
        )}

        {dispatchStatus === "dispatching" && (
          <div className="desktop-dispatch-overlay">
            <div className="spinner"></div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Affectation radio...</h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-dashboard-text-muted)" }}>
              Transmission des coordonnées GPS à {assignedAmbulance}
            </p>
          </div>
        )}

        {dispatchStatus === "success" && (
          <div className="desktop-dispatch-overlay">
            <div className="success-check-circle">✓</div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--color-urgency-success)" }}>Véhicule Assigné</h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-dashboard-text-muted)" }}>
              {assignedAmbulance} a accusé réception et se dirige sur les lieux.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-app-wrapper">
      
      {/* SIDEBAR (Desktop) */}
      <div className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">WM</div>
          <span className="brand-name">Won-Mally SOS</span>
        </div>

        <div className="sidebar-menu">
          <button 
            className={`sidebar-menu-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <GridIcon />
            <span>Tableau de Bord</span>
          </button>
          
          <button 
            className={`sidebar-menu-item ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            <ResourceIcon />
            <span>Ressources Actives</span>
          </button>
          
          <button 
            className={`sidebar-menu-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <ChartIcon />
            <span>Analytiques</span>
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">MC</div>
          <div className="profile-details">
            <span className="profile-name">Marie Curie</span>
            <span className="profile-role">Régulateur</span>
          </div>
        </div>
      </div>

      {/* ZONE PRINCIPALE */}
      <div className="dashboard-main-area">
        
        {/* En-tête (Desktop & Mobile) */}
        <div className="desktop-header-banner">
          <div className="header-left-title">
            <span className="desktop-subtitle">Centre de régulation</span>
            <h1 className="desktop-title">Bamako Centre</h1>
          </div>
          <div className="header-right-meta">
            <span className="header-clock">{time}</span>
            <div className="live-badge">
              <span className="live-dot"></span>
              <span>En direct</span>
            </div>
          </div>
        </div>

        {/* Contenu Défilant */}
        <div className="desktop-content-grid">
          
          {/* Ligne des compteurs / Metrics */}
          <div className="desktop-metrics-row">
            <div 
              className={`desktop-metric-card ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <div className="metric-card-info">
                <span className="metric-card-val">12</span>
                <span className="metric-card-lbl">Alertes</span>
              </div>
              <div className="metric-card-icon-box metric-card-icon-alerts">🚨</div>
            </div>
            
            <div 
              className={`desktop-metric-card ${activeTab === "resources" ? "active" : ""}`}
              onClick={() => setActiveTab("resources")}
            >
              <div className="metric-card-info">
                <span className="metric-card-val">4</span>
                <span className="metric-card-lbl">Ambulances</span>
              </div>
              <div className="metric-card-icon-box metric-card-icon-ambs">🚑</div>
            </div>

            <div 
              className={`desktop-metric-card ${activeTab === "resources" ? "active" : ""}`}
              onClick={() => setActiveTab("resources")}
            >
              <div className="metric-card-info">
                <span className="metric-card-val">6</span>
                <span className="metric-card-lbl">Médecins</span>
              </div>
              <div className="metric-card-icon-box metric-card-icon-docs">👨‍⚕️</div>
            </div>
          </div>

          {/* DASHBOARD PRINCIPAL (Alertes en attente + Détails côte-à-côte sur desktop) */}
          {activeTab === "dashboard" && (
            <div className="desktop-two-col-layout">
              {/* Colonne 1 : Liste des alertes */}
              <div className="dashboard-panel-card">
                <div className="panel-header">
                  <h2 className="panel-title">Alertes en attente</h2>
                  <span className="panel-badge">3 critiques</span>
                </div>

                <div className="desktop-alerts-list">
                  {mockAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`desktop-alert-item urgency-${alert.urgency} ${selectedAlert?.id === alert.id ? "selected" : ""}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="alert-left-col">
                        <div className="alert-circle-icon">
                          {alert.icon}
                        </div>
                        <div className="alert-text-group">
                          <span className="alert-title-txt">{alert.title}</span>
                          <span className="alert-subtitle-txt">{alert.address}</span>
                        </div>
                      </div>
                      <div className="alert-right-col">
                        <span className="alert-time-badge">{alert.time}</span>
                        <ArrowRightIcon />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-panel-card" style={{ minHeight: "350px" }}>
                <div className="panel-header">
                  <h2 className="panel-title">Fiche d'Intervention</h2>
                  {selectedAlert && (
                    <Link to={`/medical-center/alerts/${selectedAlert.id}`} style={{ fontSize: "0.8rem", color: "var(--color-dashboard-blue)", fontWeight: 600, textDecoration: "none" }}>
                      Plein écran ↗
                    </Link>
                  )}
                </div>
                {selectedAlert ? (
                  renderAlertDetailsContent()
                ) : (
                  <div style={{
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    flex: 1, 
                    color: "var(--color-dashboard-text-muted)", 
                    textAlign: "center",
                    padding: "40px 10px"
                  }}>
                    <span style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📋</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      Sélectionnez une alerte à gauche pour afficher ses détails et coordonner les secours.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE DES RESSOURCES (Ambulances + Médecins) */}
          {activeTab === "resources" && (
            <div className="desktop-resources-grid">
              
              {/* Liste Ambulances */}
              <div className="resource-list-panel">
                <div className="panel-header">
                  <h2 className="panel-title">Ambulances Disponibles</h2>
                </div>
                <div className="res-cards-container">
                  {mockAmbulances.map(amb => (
                    <div key={amb.id} className="desktop-res-card">
                      <div className="res-left-group">
                        <div className="res-avatar-icon">🚑</div>
                        <div>
                          <div className="res-name-txt">{amb.name}</div>
                          <div className="res-meta-txt">{amb.type} • {amb.phone}</div>
                        </div>
                      </div>
                      <span className={`res-status-tag ${amb.status === "Disponible" ? "available" : "busy"}`}>
                        {amb.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liste Médecins */}
              <div className="resource-list-panel">
                <div className="panel-header">
                  <h2 className="panel-title">Médecins Urgentistes</h2>
                </div>
                <div className="res-cards-container">
                  {mockDoctors.map(doc => (
                    <div key={doc.id} className="desktop-res-card">
                      <div className="res-left-group">
                        <div className="res-avatar-icon">👨‍⚕️</div>
                        <div>
                          <div className="res-name-txt">{doc.name}</div>
                          <div className="res-meta-txt">{doc.specialty} • {doc.phone}</div>
                        </div>
                      </div>
                      <span className={`res-status-tag ${doc.status === "Disponible" ? "available" : "busy"}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PAGE DES STATISTIQUES (Analytics) */}
          {activeTab === "analytics" && (
            <div className="desktop-analytics-layout">
              <div className="analytics-top-row">
                
                <div className="big-chart-card">
                  <h3 className="chart-card-title" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", margin: 0 }}>
                    Type d'intervention (Aujourd'hui)
                  </h3>
                  <div className="horizontal-bars-container" style={{ paddingTop: "10px" }}>
                    <div className="bar-item-row">
                      <span className="bar-row-label">Malaise Cardiaque</span>
                      <div className="bar-row-track">
                        <div className="bar-row-fill" style={{ width: animateChart ? "75%" : "0%", backgroundColor: "var(--color-urgency-high)" }}></div>
                      </div>
                      <span className="bar-row-value">15</span>
                    </div>
                    <div className="bar-item-row">
                      <span className="bar-row-label">Accident de la route</span>
                      <div className="bar-row-track">
                        <div className="bar-row-fill" style={{ width: animateChart ? "50%" : "0%", backgroundColor: "var(--color-urgency-medium)" }}></div>
                      </div>
                      <span className="bar-row-value">10</span>
                    </div>
                    <div className="bar-item-row">
                      <span className="bar-row-label">Urgences Maternelles</span>
                      <div className="bar-row-track">
                        <div className="bar-row-fill" style={{ width: animateChart ? "30%" : "0%", backgroundColor: "var(--color-dashboard-blue)" }}></div>
                      </div>
                      <span className="bar-row-value">6</span>
                    </div>
                    <div className="bar-item-row">
                      <span className="bar-row-label">Traumatologie / Chutes</span>
                      <div className="bar-row-track">
                        <div className="bar-row-fill" style={{ width: animateChart ? "40%" : "0%", backgroundColor: "var(--color-urgency-high)" }}></div>
                      </div>
                      <span className="bar-row-value">8</span>
                    </div>
                  </div>
                </div>

                <div className="donut-cards-grid">
                  <div className="donut-mini-card">
                    <div className="donut-visual-container"></div>
                    <div className="donut-card-txt-group">
                      <span className="donut-card-title">Temps de réponse moyen</span>
                      <span className="donut-card-value">7.2 minutes</span>
                    </div>
                  </div>

                  <div className="donut-mini-card">
                    <div className="donut-visual-container" style={{ borderTopColor: "var(--color-urgency-success)", borderRightColor: "var(--color-urgency-success)" }}></div>
                    <div className="donut-card-txt-group">
                      <span className="donut-card-title">Taux de Prise en Charge</span>
                      <span className="donut-card-value">96.8%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Étiquette flottante "1 - Dashboard régulateur" */}
        {showLabel && (
          <div className="floating-mockup-label">
            <span>1 • Dashboard régulateur</span>
            <button 
              className="label-close"
              onClick={() => setShowLabel(false)}
              aria-label="Fermer"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* NAVIGATION BOTTOM MOBILE (Masquée sur desktop) */}
        <div className="mobile-bottom-nav">
          <button 
            className={`mobile-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-nav-icon">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          
          <button 
            className={`mobile-nav-btn ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-nav-icon">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </button>
          
          <button 
            className={`mobile-nav-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mobile-nav-icon">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
        </div>

        {/* MODAL TIROIR MOBILE (Uniquement sur mobile et si une alerte est cliquée) */}
        {selectedAlert && window.innerWidth <= 900 && (
          <div className="mobile-drawer-backdrop" onClick={() => dispatchStatus === "idle" && setSelectedAlert(null)}>
            <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{selectedAlert.title}</h3>
                <button 
                  style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--color-dashboard-text-muted)" }}
                  onClick={() => setSelectedAlert(null)}
                >
                  ✕
                </button>
              </div>
              {renderAlertDetailsContent()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
