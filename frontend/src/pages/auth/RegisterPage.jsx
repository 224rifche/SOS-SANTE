import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "../../styles/global.css";

const registerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Au moins 8 caractères"),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Compte créé avec succès");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création du compte.");
    }
  };

  return (
    <div className="auth-ne-wrapper">
      <div className="auth-ne-brand">
        <Link to="/" className="auth-ne-logo text-decoration-none text-white">
          <span className="auth-ne-logo-icon">NE</span>
          <span>
            <strong>Nhellan Emergency</strong>
            <small>Chaque seconde compte</small>
          </span>
        </Link>

        <div className="auth-ne-brand-content">
          <span className="auth-ne-badge">Plateforme médicale certifiée</span>
          <h1>Rejoignez la communauté</h1>
          <p>
            Créez votre compte pour accéder aux services d'urgence,
            suivre vos demandes en temps réel et sauver des vies.
          </p>
          <ul className="auth-ne-features">
            <li>Accès instantané aux services d'urgence</li>
            <li>Suivi en temps réel de vos demandes</li>
            <li>Communication sécurisée avec les professionnels</li>
          </ul>
        </div>

        <svg className="auth-ne-pulse" viewBox="0 0 460 80" aria-hidden="true">
          <path d="M0 40 L80 40 L100 10 L125 70 L145 40 L200 40 L215 25 L230 55 L260 40 L460 40" fill="none" stroke="rgba(229,57,53,0.6)" strokeWidth="2" />
        </svg>
      </div>

      <div className="auth-ne-form-panel">
        <div className="auth-ne-form-card">
          <div className="text-center mb-4 d-lg-none">
            <span className="auth-ne-logo-icon d-inline-flex mb-2">NE</span>
            <h2 className="h5 fw-bold mb-0">Nhellan Emergency</h2>
          </div>

          <h2 className="auth-ne-form-title">Création de compte</h2>
          <p className="auth-ne-form-sub">Rejoignez la plateforme d'urgence</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="auth-ne-label" htmlFor="firstName">Prénom</label>
                <input
                  id="firstName"
                  type="text"
                  className={`auth-ne-input ${errors.firstName ? "is-invalid" : ""}`}
                  placeholder="Jean"
                  {...register("firstName")}
                />
                {errors.firstName && <p className="auth-ne-error">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="auth-ne-label" htmlFor="lastName">Nom</label>
                <input
                  id="lastName"
                  type="text"
                  className={`auth-ne-input ${errors.lastName ? "is-invalid" : ""}`}
                  placeholder="Dupont"
                  {...register("lastName")}
                />
                {errors.lastName && <p className="auth-ne-error">{errors.lastName.message}</p>}
              </div>
            </div>

            <label className="auth-ne-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`auth-ne-input ${errors.email ? "is-invalid" : ""}`}
              placeholder="vous@exemple.com"
              {...register("email")}
            />
            {errors.email && <p className="auth-ne-error">{errors.email.message}</p>}

            <label className="auth-ne-label" htmlFor="phone">Téléphone (optionnel)</label>
            <input
              id="phone"
              type="tel"
              className={`auth-ne-input ${errors.phone ? "is-invalid" : ""}`}
              placeholder="+33 6 12 34 56 78"
              {...register("phone")}
            />
            {errors.phone && <p className="auth-ne-error">{errors.phone.message}</p>}

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
              {isSubmitting ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <p className="auth-ne-footer">
            Déjà inscrit ?{" "}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
