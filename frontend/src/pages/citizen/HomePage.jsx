import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldAlert, Headphones, Truck } from 'lucide-react';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* LOGO ET NOM DE L'APPLICATION */}
        <div className={styles.brandSection}>
          <div className={styles.logoWrapper}>
            <HeartPulse className="w-9 h-9 text-white stroke-[2]" />
          </div>
          <h1 className={styles.appName}>SOS <span>Santé</span></h1>
          <p className={styles.brandTagline}>Votre vie, notre priorité absolue</p>
        </div>

        {/* EXPLICATION DU FONCTIONNEMENT */}
        <div className={styles.explanationSection}>
          <h2 className={styles.sectionTitle}>Comment ça marche ?</h2>
          
          <div className={styles.stepsList}>
            
            {/* ÉTAPE 1 */}
            <div className={styles.stepItem}>
              <div className={styles.stepIcon}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitleText}>1. Signalez l'urgence</h3>
                <p className={styles.stepDesc}>
                  Sélectionnez le problème (malaise, accident) et transmettez instantanément votre position GPS.
                </p>
              </div>
            </div>

            {/* ÉTAPE 2 */}
            <div className={styles.stepItem}>
              <div className={styles.stepIcon}>
                <Headphones className="w-5 h-5" />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitleText}>2. Prise en charge médicale</h3>
                <p className={styles.stepDesc}>
                  Les médecins régulateurs reçoivent vos informations et valident immédiatement l'envoi des secours.
                </p>
              </div>
            </div>

            {/* ÉTAPE 3 */}
            <div className={styles.stepItem}>
              <div className={styles.stepIcon}>
                <Truck className="w-5 h-5" />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitleText}>3. Suivi en temps réel</h3>
                <p className={styles.stepDesc}>
                  Suivez la progression de l'ambulance envoyée vers vous directement sur la carte de votre écran.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* BOUTONS DE CONNEXION / INSCRIPTION */}
        <div className={styles.actionSection}>
          <Link to="/login" className={styles.btnPrimary}>
            Se connecter
          </Link>
          <Link to="/register" className={styles.btnSecondary}>
            Créer un compte
          </Link>
        </div>

      </div>
    </div>
  );
}