import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../styles/global.css";
import logo from "../../assets/logo-wonmally.png";
import ambulance from "../../assets/ambulance.png";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    authService.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        const message = err.response?.data?.message || "";
        if (message.includes("deja ete verifie") || message.includes("déjà été vérifié")) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      });
  }, [token]);

  return (
    <div className="auth-ne-wrapper" style={{ backgroundImage: `linear-gradient(rgba(11,21,36,0.85), rgba(11,21,36,0.85)), url(${ambulance})` }}>
      <div className="auth-ne-form-panel">
        <div className="auth-ne-form-card">
          <div className="text-center mb-4">
            <img src={logo} alt="Wonmally" className="auth-ne-logo-icon d-inline-flex mb-2" />
            <h2 className="h5 fw-bold mb-0">Wonmally</h2>
          </div>

          {status === "loading" && (
            <>
              <h2 className="auth-ne-form-title">Verification en cours...</h2>
              <p className="auth-ne-form-sub">Merci de patienter un instant.</p>
            </>
          )}

          {status === "success" && (
            <>
              <h2 className="auth-ne-form-title">Email verifie !</h2>
              <p className="auth-ne-form-sub">
                Votre adresse email a ete verifiee avec succes. Vous pouvez maintenant vous connecter.
              </p>
              <p className="auth-ne-footer">
                <Link to="/login">Se connecter</Link>
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <h2 className="auth-ne-form-title">Lien invalide</h2>
              <p className="auth-ne-form-sub">
                Ce lien de verification est invalide, a deja ete utilise, ou a expire.
              </p>
              <p className="auth-ne-footer">
                <Link to="/login">Retour a la connexion</Link>
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <h2 className="auth-ne-form-title">Lien incomplet</h2>
              <p className="auth-ne-form-sub">
                Ce lien de verification est incomplet.
              </p>
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
