import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

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
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-5">
          {/* Heartbeat/Emergency Header */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle p-3 mb-3 shadow-sm border border-danger border-opacity-25" style={{ width: "70px", height: "70px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-heart-pulse-fill" viewBox="0 0 16 16">
                <path d="M1.475 9c.085.302.263.58.53.754l.003.002 4.795 3.197a1 1 0 0 0 1.114 0l4.794-3.197c.27-.174.448-.452.533-.754H1.475ZM0 8a1.5 1.5 0 0 1 .728-1.286l.007-.005 5.9-3.933a1.5 1.5 0 0 1 1.662 0l5.9 3.933.007.005A1.5 1.5 0 0 1 16 8H0Zm5.443-4.757a.5.5 0 0 0-.586.378l-1.05 4.2H.5a.5.5 0 0 0 0 1h3.75a.5.5 0 0 0 .485-.378l.78-3.12 1.345 5.38a.5.5 0 0 0 .97.003l1.11-4.44 1.162 2.324a.5.5 0 0 0 .893.006L12 6.4h3.5a.5.5 0 0 0 0-1H11.5a.5.5 0 0 0-.447.276L10.3 7.15l-1.42-2.84a.5.5 0 0 0-.904-.038L6.87 8.71 5.443 3.243Z"/>
              </svg>
            </div>
            <h2 className="fw-bold text-dark mb-1">Won-Mally</h2>
            <p className="text-secondary small">Gestion Intelligente des Urgences Médicales</p>
          </div>

          {/* Login Card */}
          <div className="card border-0 shadow-lg p-4 rounded-4" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
            <h4 className="fw-bold mb-4 text-center">Connexion</h4>
            
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email Input */}
              <div className="form-floating mb-3">
                <input 
                  type="email" 
                  className={`form-control border-secondary border-opacity-25 ${errors.email ? "is-invalid" : ""}`} 
                  id="emailInput" 
                  placeholder="name@example.com"
                  {...register("email")} 
                />
                <label htmlFor="emailInput">Adresse email</label>
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              {/* Password Input */}
              <div className="form-floating mb-4">
                <input 
                  type="password" 
                  className={`form-control border-secondary border-opacity-25 ${errors.password ? "is-invalid" : ""}`} 
                  id="passwordInput" 
                  placeholder="Mot de passe"
                  {...register("password")} 
                />
                <label htmlFor="passwordInput">Mot de passe</label>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 py-3 rounded-3 shadow-sm fw-semibold mb-3"
                style={{ transition: "all 0.2s ease" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                ) : null}
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            <div className="text-center mt-3">
              <p className="mb-0 text-secondary small">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
