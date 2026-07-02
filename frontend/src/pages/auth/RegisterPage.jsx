import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

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
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-10 col-lg-6">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle p-3 mb-3 shadow-sm border border-danger border-opacity-25" style={{ width: "70px", height: "70px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-heart-pulse-fill" viewBox="0 0 16 16">
                <path d="M1.475 9c.085.302.263.58.53.754l.003.002 4.795 3.197a1 1 0 0 0 1.114 0l4.794-3.197c.27-.174.448-.452.533-.754H1.475ZM0 8a1.5 1.5 0 0 1 .728-1.286l.007-.005 5.9-3.933a1.5 1.5 0 0 1 1.662 0l5.9 3.933.007.005A1.5 1.5 0 0 1 16 8H0Zm5.443-4.757a.5.5 0 0 0-.586.378l-1.05 4.2H.5a.5.5 0 0 0 0 1h3.75a.5.5 0 0 0 .485-.378l.78-3.12 1.345 5.38a.5.5 0 0 0 .97.003l1.11-4.44 1.162 2.324a.5.5 0 0 0 .893.006L12 6.4h3.5a.5.5 0 0 0 0-1H11.5a.5.5 0 0 0-.447.276L10.3 7.15l-1.42-2.84a.5.5 0 0 0-.904-.038L6.87 8.71 5.443 3.243Z"/>
              </svg>
            </div>
            <h2 className="fw-bold text-dark mb-1">Won-Mally</h2>
            <p className="text-secondary small">Rejoignez la plateforme d'entraide médicale</p>
          </div>

          {/* Register Card */}
          <div className="card border-0 shadow-lg p-4 rounded-4" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
            <h4 className="fw-bold mb-4 text-center">Création de compte</h4>
            
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row">
                {/* First Name */}
                <div className="col-12 col-sm-6 mb-3">
                  <div className="form-floating">
                    <input 
                      type="text" 
                      className={`form-control border-secondary border-opacity-25 ${errors.firstName ? "is-invalid" : ""}`} 
                      id="firstNameInput" 
                      placeholder="Prénom"
                      {...register("firstName")} 
                    />
                    <label htmlFor="firstNameInput">Prénom</label>
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                  </div>
                </div>

                {/* Last Name */}
                <div className="col-12 col-sm-6 mb-3">
                  <div className="form-floating">
                    <input 
                      type="text" 
                      className={`form-control border-secondary border-opacity-25 ${errors.lastName ? "is-invalid" : ""}`} 
                      id="lastNameInput" 
                      placeholder="Nom"
                      {...register("lastName")} 
                    />
                    <label htmlFor="lastNameInput">Nom de famille</label>
                    {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                  </div>
                </div>
              </div>

              {/* Email */}
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

              {/* Phone */}
              <div className="form-floating mb-3">
                <input 
                  type="tel" 
                  className={`form-control border-secondary border-opacity-25 ${errors.phone ? "is-invalid" : ""}`} 
                  id="phoneInput" 
                  placeholder="Téléphone"
                  {...register("phone")} 
                />
                <label htmlFor="phoneInput">Numéro de téléphone (optionnel)</label>
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>

              {/* Password */}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                ) : null}
                {isSubmitting ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>

            <div className="text-center mt-3">
              <p className="mb-0 text-secondary small">
                Déjà inscrit ?{" "}
                <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
