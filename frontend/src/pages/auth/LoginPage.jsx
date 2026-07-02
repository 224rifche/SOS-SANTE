import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ta logique de connexion avec l'API Spring Boot viendra se brancher ici
    console.log("Connexion avec :", { email, password });
    
    // Redirection temporaire pour tester ton flux d'écrans
    navigate('/sos/details');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topSection}>
          
          {/* EN-TÊTE */}
          <div className={styles.header}>
            <h1 className={styles.title}>Connexion</h1>
            <p className={styles.subtitle}>Accédez à votre espace SOS Santé</p>
          </div>

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* ENTRÉE EMAIL */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Adresse e-mail</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  placeholder="exemple@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            {/* ENTRÉE MOT DE PASSE */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Mot de passe</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            {/* BOUTON DE CONNEXION */}
            <button type="submit" className={styles.button}>
              Se connecter
            </button>
          </form>

          {/* LIEN VERS INSCRIPTION */}
          <div className={styles.footer}>
            <p>Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
