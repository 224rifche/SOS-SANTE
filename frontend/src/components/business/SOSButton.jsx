import { useState } from "react";

/**
 * Bouton SOS principal - point d'entree critique de la plateforme.
 * Conforme aux principes UX : action accessible en moins de 3 interactions,
 * confirmation avant envoi pour eviter le declenchement accidentel.
 */
export default function SOSButton({ onTrigger, disabled }) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setConfirming(false);
    onTrigger();
  };

  return (
    <button
      type="button"
      className={`sos-button ${confirming ? "sos-button--confirming" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label="Declencher une alerte SOS"
    >
      {confirming ? "Confirmer l'envoi ?" : "SOS"}
    </button>
  );
}
