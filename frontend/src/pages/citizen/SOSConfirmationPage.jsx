import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import styles from './SOSConfirmationPage.module.css';

export default function SOSConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.iconCircle}>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 stroke-[1.5]" />
          </div>
          <h1 className={styles.title}>Demande envoyée !</h1>
          <p className={styles.message}>
            Votre alerte a bien été transmise aux services de régulation médicale.
          </p>
          <p className={styles.subMessage}>Une ambulance va être affectée d'un instant à l'autre.</p>
        </div>

        <div>
          <button onClick={() => navigate('/sos/suivi')} className={styles.btnAction}>
            Suivre l'intervention
          </button>
        </div>
      </div>
    </div>
  );
}