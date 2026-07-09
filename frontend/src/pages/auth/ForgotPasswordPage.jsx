import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import "../../styles/global.css";
import logo from "../../assets/logo-wonmally.png";
import ambulance from "../../assets/ambulance.png";

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
      setTimeout(() => {
        navigate("/reset-password", { state: { email: data.email } });
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Une erreur est survenue. Veuillez reessayer.");
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

          {submitted ? (
            <>
              <h2 className="auth-ne-form-title">Code envoye</h2>
              <p className="auth-ne-form-sub">
                Si un compte existe avec cette adresse, un code de reinitialisation vient de vous etre envoye par email.
                Verifiez votre boite de reception (et vos spams). Redirection...
              </p>
              <p className="auth-ne-footer">
                <Link to="/login">Retour a la connexion</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-ne-form-title">Mot de passe oublie</h2>
              <p className="auth-ne-form-sub">Saisissez votre email pour recevoir un code de reinitialisation</p>
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
                <button type="submit" className="auth-ne-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi..." : "Envoyer le code"}
                </button>
              </form>
              <p className="auth-ne-footer">
                <Link to="/login">Retour a la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}