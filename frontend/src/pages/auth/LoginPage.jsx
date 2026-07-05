import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "../../styles/global.css";
import logo from "../../assets/logo-wonmally.png";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Connexion réussie");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="auth-ne-wrapper">
      <div className="auth-ne-brand">
        <Link to="/" className="auth-ne-logo text-decoration-none text-white">
          <img src={logo} alt="Wonmally" className="auth-ne-logo-icon" />
          <span>
            <strong>Wonmally</strong>
            <small>Chaque seconde compte</small>
          </span>
        </Link>

        <div className="auth-ne-brand-content">
          <span className="auth-ne-badge">Plateforme médicale certifiée</span>
          <h1>Coordination des urgences en temps réel</h1>
          <p>
            Citoyens, centres de régulation, ambulanciers et médecins partagent
            une même plateforme pour sauver des vies.
          </p>
          <ul className="auth-ne-features">
            <li>Géolocalisation instantanée du patient</li>
            <li>Suivi ambulance en direct</li>
            <li>Régulation médicale sécurisée</li>
          </ul>
        </div>

        <svg className="auth-ne-pulse" viewBox="0 0 460 80" aria-hidden="true">
          <path d="M0 40 L80 40 L100 10 L125 70 L145 40 L200 40 L215 25 L230 55 L260 40 L460 40" fill="none" stroke="rgba(229,57,53,0.6)" strokeWidth="2" />
        </svg>
      </div>

      <div className="auth-ne-form-panel">
        <div className="auth-ne-form-card">
          <div className="text-center mb-4 d-lg-none">
            <img src={logo} alt="Wonmally" className="auth-ne-logo-icon d-inline-flex mb-2" />
            <h2 className="h5 fw-bold mb-0">Wonmally</h2>
          </div>

          <h2 className="auth-ne-form-title">Connexion</h2>
          <p className="auth-ne-form-sub">Accédez à votre espace sécurisé</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="auth-ne-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`auth-ne-input ${errors.email ? "is-invalid" : ""}`}
              placeholder="vous@exemple.com"
              {...register("email")}
            />
            {errors.email && <p className="auth-ne-error">{errors.email.message}</p>}

            <label className="auth-ne-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className={`auth-ne-input ${errors.password ? "is-invalid" : ""}`}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="auth-ne-error">{errors.password.message}</p>}

            <button type="submit" className="auth-ne-submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="auth-ne-footer">
            Pas encore de compte ?{" "}
            <Link to="/register">Créer un compte citoyen</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
