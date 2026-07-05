import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "../../styles/global.css";
import logo from "../../assets/logo-wonmally.png";
import ambulance from "../../assets/ambulance.png";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional(),
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
    <div className="auth-ne-wrapper" style={{ backgroundImage: `linear-gradient(rgba(11,21,36,0.85), rgba(11,21,36,0.85)), url(${ambulance})` }}>
      <div className="auth-ne-form-panel">
        <div className="auth-ne-form-card">         
          <div className="text-center mb-4"> 
            <img src={logo} alt="Wonmally" className="auth-ne-logo-icon d-inline-flex mb-2" />
            <h2 className="h5 fw-bold mb-0">Wonmally</h2>
          </div>
          <h2 className="auth-ne-form-title">Connexion</h2>
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

            <div className="d-flex align-items-center gap-2 mb-3">
              <input
                id="rememberMe"
                type="checkbox"
                {...register("rememberMe")}
              />
              <label htmlFor="rememberMe" className="auth-ne-label mb-0" style={{ cursor: "pointer" }}>
                Se souvenir de moi
              </label>
            </div>
            <p className="text-end mb-3">
              <Link to="/forgot-password" className="auth-ne-footer" style={{ margin: 0, fontSize: "0.85rem" }}>
                Mot de passe oublie ?
              </Link>
            </p>
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
