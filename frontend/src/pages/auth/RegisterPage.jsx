import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo-wonmally.png";
import ambulance from "../../assets/ambulance.png";
import { toast } from "react-toastify";
import "../../styles/global.css";

const registerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  password: z.string()
    .min(8, "Au moins 8 caracteres")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/\d/, "Doit contenir un chiffre"),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const passwordValue = watch("password") || "";
  const passwordRules = [
    { label: "Au moins 8 caracteres", valid: passwordValue.length >= 8 },
    { label: "Une majuscule", valid: /[A-Z]/.test(passwordValue) },
    { label: "Une minuscule", valid: /[a-z]/.test(passwordValue) },
    { label: "Un chiffre", valid: /\d/.test(passwordValue) },
  ];

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Compte cree ! Verifiez votre boite mail pour activer votre compte.");
      navigate("/verify-email", { state: { email: data.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création du compte.");
    }
  };

  return (
    <div className="auth-ne-wrapper" style={{ backgroundImage: `linear-gradient(rgba(11,21,36,0.85), rgba(11,21,36,0.85)), url(${ambulance})` }}>
      <div className="auth-ne-form-panel">
        <div className="auth-ne-form-card">
           <div className="text-center mb-4">
            <img src={logo} alt="Wonmally" className="auth-ne-logo-icon d-inline-flex mb-2" />
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
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", fontSize: "0.8rem" }}>
              {passwordRules.map((rule) => (
                <li key={rule.label} style={{ color: rule.valid ? "#16a34a" : "#94a3b8", marginBottom: "2px" }}>
                  {rule.valid ? "✓" : "○"} {rule.label}
                </li>
              ))}
            </ul>

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
