import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../styles/global.css";
import logo from "../../assets/logo-wonmally.png";
import ambulance from "../../assets/ambulance.png";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage("Merci de saisir le code a 6 chiffres recu par email.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    try {
      await authService.verifyEmail(code.trim());
      setStatus("success");
    } catch (err) {
      const message = err.response?.data?.message || "";
      if (message.includes("deja ete verifie") || message.includes("déjà été vérifié")) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(message || "Code invalide ou expire. Verifiez le code recu par email.");
      }
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

          {status === "success" ? (
            <>
              <h2 className="auth-ne-form-title">Email verifie !</h2>
              <p className="auth-ne-form-sub">
                Votre adresse email a ete verifiee avec succes. Vous pouvez maintenant vous connecter.
              </p>
              <p className="auth-ne-footer">
                <Link to="/login">Se connecter</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-ne-form-title">Verifiez votre email</h2>
              <p className="auth-ne-form-sub">
                Saisissez le code a 6 chiffres recu par email pour activer votre compte.
              </p>

              {errorMessage && (
                <div className="alert alert-danger py-2 small">{errorMessage}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small">Adresse email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    disabled={status === "loading"}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small">Code de verification</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="form-control text-center"
                    style={{ letterSpacing: "0.5em", fontSize: "1.5rem", fontWeight: "700" }}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                    disabled={status === "loading"}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={status === "loading" || code.length !== 6}
                >
                  {status === "loading" ? "Verification..." : "Verifier mon compte"}
                </button>
              </form>

              <p className="auth-ne-footer mt-3">
                <Link to="/login">Retour a la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}