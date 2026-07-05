import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import "../../styles/global.css";
import logo from "../../assets/logo-wonmally.png";
import ambulance from "../../assets/ambulance.png";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Au moins 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Lien de reinitialisation invalide.");
      return;
    }
    try {
      await authService.resetPassword(token, data.newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ce lien est invalide ou a expire.");
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

          {!token ? (
            <>
              <h2 className="auth-ne-form-title">Lien invalide</h2>
              <p className="auth-ne-form-sub">
                Ce lien de reinitialisation est invalide ou incomplet.
              </p>
              <p className="auth-ne-footer">
                <Link to="/forgot-password">Redemander un lien</Link>
              </p>
            </>
          ) : success ? (
            <>
              <h2 className="auth-ne-form-title">Mot de passe modifie</h2>
              <p className="auth-ne-form-sub">
                Votre mot de passe a ete reinitialise avec succes. Redirection vers la connexion...
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-ne-form-title">Nouveau mot de passe</h2>
              <p className="auth-ne-form-sub">Choisissez votre nouveau mot de passe</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="auth-ne-label" htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="password"
                  className={`auth-ne-input ${errors.newPassword ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  {...register("newPassword")}
                />
                {errors.newPassword && <p className="auth-ne-error">{errors.newPassword.message}</p>}

                <label className="auth-ne-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`auth-ne-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="auth-ne-error">{errors.confirmPassword.message}</p>}

                <button type="submit" className="auth-ne-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Modification..." : "Reinitialiser le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}