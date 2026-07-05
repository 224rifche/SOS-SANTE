import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import Icon from "../../components/ui/Icon";
import logo from "../../assets/logo-wonmally.png";

const PROBLEMS = [
  {
    icon: "⚡",
    title: "Appels non localises",
    text: "La position exacte du patient reste incertaine, retardant l'envoi des secours.",
  },
  {
    icon: "🔄",
    title: "Coordination manuelle",
    text: "Regulateurs, ambulanciers et medecins travaillent sur des outils deconnectes.",
  },
  {
    icon: "👁",
    title: "Aucune visibilite",
    text: "Le citoyen ignore ou en est son secours; le stress monte, l'information manque.",
  },
];

const FEATURES = [
  { icon: "🆘", title: "Bouton SOS instantane", text: "Un geste declenche l'alerte, transmet la position GPS et les informations medicales du citoyen." },
  { icon: "📡", title: "Regulation temps reel", text: "Le centre recoit, priorise et valide les alertes sur un tableau de bord vivant." },
  { icon: "🚑", title: "Affectation ambulance", text: "L'unite la plus proche est missionnee; l'ambulancier accepte et navigue au patient." },
  { icon: "📋", title: "Dossier medecin", text: "Le medecin prepare la prise en charge et suit le patient avant meme son arrivee." },
  { icon: "🔔", title: "Notifications push", text: "Chaque changement de statut alerte instantanement les profils concernes." },
  { icon: "📊", title: "Supervision & stats", text: "L'administrateur pilote centres, utilisateurs et performances de la plateforme." },
];

const STEPS = [
  { num: 1, color: "danger", title: "Declencher l'alerte", text: "Le citoyen appuie sur SOS, envoie sa position et son motif." },
  { num: 2, color: "primary", title: "Valider & reguler", text: "Le centre analyse, priorise puis confirme l'intervention." },
  { num: 3, color: "success", title: "Affecter & router", text: "L'ambulance la plus proche est missionnee et guidee." },
  { num: 4, color: "warning", title: "Prendre en charge", text: "Le medecin prepare le patient et cloture l'intervention." },
];

const FAQS = [
  { q: "Comment declencher une alerte SOS ?", a: "Connectez-vous, appuyez sur le bouton SOS, selectionnez le type d'urgence : votre position et votre demande sont transmises immediatement au centre medical le plus proche." },
  { q: "Le suivi de l'ambulance est-il vraiment en temps reel ?", a: "Oui. La position de l'ambulance et le statut de l'intervention sont mis a jour via WebSocket, sans avoir a rafraichir la page." },
  { q: "Mes donnees medicales sont-elles protegees ?", a: "Vos donnees sont chiffrees et uniquement accessibles aux professionnels impliques dans votre prise en charge, conformement aux principes RGPD." },
  { q: "Qui utilise Wonmally ?", a: "Citoyens, centres medicaux, ambulanciers, medecins et administrateurs partagent une meme plateforme, chacun avec un acces adapte a son role." },
  { q: "L'application fonctionne-t-elle hors ligne ?", a: "La geolocalisation et l'envoi d'alerte necessitent une connexion internet active pour garantir la fiabilite de la transmission au centre de regulation." },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border rounded-4 mb-2 overflow-hidden bg-white">
      <button
        type="button"
        className="btn w-100 d-flex justify-content-between align-items-center text-start p-3 fw-semibold"
        onClick={onToggle}
      >
        <span>{item.q}</span>
        <span className="text-primary fs-5">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 text-secondary small">{item.a}</div>
      )}
    </div>
  );
}

export default function WelcomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    dashboardService.getPublicStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => { if (!cancelled) setStatsError(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-100">

      {/* ============ HEADER ============ */}
      <header className="d-flex align-items-center justify-content-between px-4 py-3 text-white" style={{ background: "#0B1524" }}>
        <div className="d-flex align-items-center gap-2">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3" style={{ width: "34px", height: "34px" }}>
           <img src={logo} alt="logo du projet" style={{ width: "50px", height: "50px" }} /> 
          </div>
        </div>

        <nav className="d-none d-lg-flex gap-4 small">
          <a href="#solution" className="text-white-50 text-decoration-none">Solution</a>
          <a href="#fonctionnalites" className="text-white-50 text-decoration-none">Fonctionnalites</a>
          <a href="#comment-ca-marche" className="text-white-50 text-decoration-none">Comment ca marche</a>
          <a href="#faq" className="text-white-50 text-decoration-none">FAQ</a>
        </nav>

        <div className="d-flex align-items-center gap-2">
          <Link to="/login" className="btn btn-link text-white text-decoration-none small">Se connecter</Link>
          <Link to="/login" className="btn btn-danger btn-sm fw-semibold rounded-3 px-3">
            Declencher un SOS
          </Link>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="text-white px-4 py-5" style={{ background: "linear-gradient(160deg, #0B1524 0%, #12213A 100%)" }}>
        <div className="row align-items-center g-5 mx-auto" style={{ maxWidth: "1140px" }}>
          <div className="col-12 col-lg-6">
            <span className="badge bg-white bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 mb-3 small">
              ● Temps reel &nbsp;·&nbsp; Plateforme de coordination des urgences medicales
            </span>
            <h1 className="fw-bold display-5 mb-3">
              Chaque seconde compte.<br />
              <span className="text-danger">Chaque vie</span> merite une reponse.
            </h1>
            <p className="text-white-50 fs-5 mb-4">
              Wonmally relie citoyens, centres de regulation, ambulanciers et medecins
              sur une seule plateforme intelligente — pour declencher, valider et coordonner
              une intervention en quelques secondes.
            </p>
            <div className="d-flex flex-wrap gap-3 mb-5">
              <Link to="/login" className="btn btn-danger btn-lg rounded-3 fw-bold px-4">SOS Declencher un SOS</Link>
              <a href="#comment-ca-marche" className="btn btn-outline-light btn-lg rounded-3 fw-semibold px-4">
                Voir comment ca marche
              </a>
            </div>

            {/* Statistiques reelles issues du backend */}
            <div className="d-flex flex-wrap gap-4">
              <div>
                <p className="fw-bold fs-4 mb-0">
                  {stats ? stats.totalAlertsHandled : statsError ? "—" : "…"}
                </p>
                <p className="text-white-50 small mb-0">Alertes traitees</p>
              </div>
              <div>
                <p className="fw-bold fs-4 mb-0">
                  {stats ? stats.availableAmbulances : statsError ? "—" : "…"}
                </p>
                <p className="text-white-50 small mb-0">Ambulances disponibles</p>
              </div>
              <div>
                <p className="fw-bold fs-4 mb-0">
                  {stats ? stats.activeInterventions : statsError ? "—" : "…"}
                </p>
                <p className="text-white-50 small mb-0">Interventions actives</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 d-flex justify-content-center">
            <div className="card border-0 rounded-4 shadow-lg p-4 text-dark" style={{ maxWidth: "320px", width: "100%" }}>
              <p className="fw-bold mb-3">Plateforme en direct</p>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-secondary small">Alertes traitees</span>
                <span className="fw-bold">{stats ? stats.totalAlertsHandled : "…"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-secondary small">Ambulances disponibles</span>
                <span className="fw-bold">{stats ? stats.availableAmbulances : "…"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Interventions en cours</span>
                <span className="fw-bold">{stats ? stats.activeInterventions : "…"}</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ============ PROBLEME ============ */}
      <section id="solution" className="px-4 py-5 bg-light">
        <div className="mx-auto" style={{ maxWidth: "1140px" }}>
          <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 mb-3 small">● LE PROBLEME</span>
          <h2 className="fw-bold display-6 mb-3">
            Dans l'urgence, chaque minute<br />perdue coute des vies.
          </h2>
          <p className="text-secondary fs-6 mb-4" style={{ maxWidth: "600px" }}>
            Appels disperses, localisation approximative, coordination manuelle entre les secours.
            La chaine de prise en charge se fragilise la ou la vitesse est vitale.
          </p>

          <div className="row g-3 mb-5">
            {PROBLEMS.map((p) => (
              <div className="col-12 col-md-4" key={p.title}>
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <div className="mb-3"><Icon name={p.icon} size={28} color="#E53935" /></div>
                  <p className="fw-bold mb-2">{p.title}</p>
                  <p className="text-secondary small mb-0">{p.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ============ SOLUTION ============ */}
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-3 small">● LA SOLUTION</span>
              <h2 className="fw-bold display-6 mb-3">
                Une seule plateforme, de<br />l'alerte a la prise en charge.
              </h2>
              <p className="text-secondary mb-4">
                Wonmally orchestre toute la chaine des secours en temps reel. Le citoyen
                declenche, le centre valide, l'ambulance est affectee, le medecin prepare —
                chacun voit la meme information, a la seconde pres.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li className="d-flex gap-2">
                  <span className="text-success">✓</span>
                  <div>
                    <p className="fw-semibold mb-0">Geolocalisation instantanee</p>
                    <p className="text-secondary small mb-0">Position GPS transmise des le declenchement du SOS.</p>
                  </div>
                </li>
                <li className="d-flex gap-2">
                  <span className="text-success">✓</span>
                  <div>
                    <p className="fw-semibold mb-0">Regulation intelligente</p>
                    <p className="text-secondary small mb-0">Priorisation des alertes et affectation de l'unite la plus proche.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-12 col-lg-6">
              <div className="rounded-4 p-4 text-white" style={{ background: "#0B1524" }}>
                <p className="fw-semibold mb-3">Chaine de traitement d'une alerte</p>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-start gap-2 bg-white bg-opacity-10 rounded-3 p-2">
                    <span className="badge bg-danger">SOS</span>
                    <p className="small fw-semibold mb-0">Alerte declenchee par le citoyen</p>
                  </div>
                  <div className="d-flex align-items-start gap-2 bg-white bg-opacity-10 rounded-3 p-2">
                    <span className="badge bg-primary">✓</span>
                    <p className="small fw-semibold mb-0">Validee par le centre de regulation</p>
                  </div>
                  <div className="d-flex align-items-start gap-2 bg-white bg-opacity-10 rounded-3 p-2">
                    <span className="badge bg-success">🚑</span>
                    <p className="small fw-semibold mb-0">Ambulance affectee et en route</p>
                  </div>
                  <div className="d-flex align-items-start gap-2 rounded-3 p-2" style={{ opacity: 0.5 }}>
                    <span className="badge bg-secondary">⋯</span>
                    <p className="small fw-semibold mb-0">Medecin en preparation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FONCTIONNALITES ============ */}
      <section id="fonctionnalites" className="px-4 py-5">
        <div className="mx-auto text-center" style={{ maxWidth: "700px" }}>
          <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 mb-3 small">● FONCTIONNALITES</span>
          <h2 className="fw-bold display-6 mb-3">Tout ce qu'il faut pour agir vite, ensemble.</h2>
          <p className="text-secondary mb-5">
            Cinq profils, un objectif : reduire le delai entre l'alerte et la prise en charge.
          </p>
        </div>

        <div className="row g-3 mx-auto" style={{ maxWidth: "1140px" }}>
          {FEATURES.map((f) => (
            <div className="col-12 col-md-6 col-lg-4" key={f.title}>
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <div className="mb-3"><Icon name={f.icon} size={28} color="#1565C0" /></div>
                <p className="fw-bold mb-2">{f.title}</p>
                <p className="text-secondary small mb-0">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ COMMENT CA MARCHE ============ */}
      <section id="comment-ca-marche" className="px-4 py-5 text-white" style={{ background: "#0B1524" }}>
        <div className="mx-auto text-center mb-5" style={{ maxWidth: "700px" }}>
          <span className="badge bg-white bg-opacity-10 text-success rounded-pill px-3 py-2 mb-3 small">● COMMENT CA MARCHE</span>
          <h2 className="fw-bold display-6 mb-0">Quatre etapes, quelques secondes.</h2>
        </div>

        <div className="row g-3 mx-auto" style={{ maxWidth: "1140px" }}>
          {STEPS.map((s) => (
            <div className="col-6 col-lg-3" key={s.num}>
              <div className="rounded-4 p-3 h-100" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className={`badge bg-${s.color} rounded-circle mb-2`} style={{ width: "28px", height: "28px" }}>{s.num}</span>
                <p className="fw-bold mb-1">{s.title}</p>
                <p className="text-white-50 small mb-0">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="px-4 py-5 bg-light">
        <h2 className="fw-bold text-center mb-4">Questions frequentes</h2>
        <div className="mx-auto" style={{ maxWidth: "700px" }}>
          {FAQS.map((item, index) => (
            <FaqItem
              key={item.q}
              item={item}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="px-4 py-5 text-white text-center" style={{ background: "#0B1524" }}>
        <h2 className="fw-bold display-6 mb-2">Pret a repondre plus vite ?</h2>
        <p className="text-white-50 mb-4">
          Rejoignez la plateforme qui coordonne l'urgence medicale, de l'alerte a la prise en charge.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link to="/login" className="btn btn-danger btn-lg rounded-3 fw-bold px-4">SOS Declencher un SOS</Link>
          <Link to="/register" className="btn btn-outline-light btn-lg rounded-3 fw-semibold px-4">Creer un compte</Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="px-4 py-4 text-center text-white-50 small" style={{ background: "#060C16" }}>
        © {new Date().getFullYear()} Wonmally — Chaque seconde compte.
      </footer>

    </div>
  );
}