import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ta logique d'inscription avec l'API Spring Boot viendra se brancher ici
    console.log("Inscription avec :", { name, email, password });

    // Redirection temporaire pour tester ton flux d'écrans
    navigate('/sos/details');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topSection}>
          
          {/* EN-TÊTE */}
          <div className={styles.header}>
            <h1 className={styles.title}>Inscription</h1>
            <p className={styles.subtitle}>Créez votre compte SOS Santé</p>
          </div>

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* ENTRÉE NOM */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nom complet</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

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

            {/* BOUTON D'INSCRIPTION */}
            <button type="submit" className={styles.button}>
              S'inscrire
            </button>
          </form>

          {/* LIEN VERS CONNEXION */}
          <div className={styles.footer}>
            <p>Déjà un compte ? <Link to="/login">Connectez-vous</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
