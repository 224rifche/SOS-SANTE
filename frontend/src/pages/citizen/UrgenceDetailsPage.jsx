import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Car, HeartCrack, Flame, Mic, Camera } from 'lucide-react';
import styles from './UrgenceDetailsPage.module.css'; // 👈 On importe nos styles ici !

export default function UrgenceDetailsPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('malaise');
  const [description, setDescription] = useState('Homme, 58 ans, douleur thoracique intense et sueurs...');

  const typesUrgence = [
    { id: 'malaise', title: 'Malaise cardiaque', icon: <Activity className="w-6 h-6 text-red-500" /> },
    { id: 'accident', title: 'Accident', icon: <Car className="w-6 h-6 text-gray-700" /> },
    { id: 'dextresse', title: 'Détresse respiratoire', icon: <HeartCrack className="w-6 h-6 text-gray-700" /> },
    { id: 'blessure', title: 'Blessure grave', icon: <Flame className="w-6 h-6 text-gray-700" /> },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>
          
          {/* EN-TÊTE */}
          <div className={styles.header}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={styles.title}>Type d'urgence</h1>
          </div>
          
          <p className={styles.subtitle}>Sélectionnez la nature de l'urgence</p>

          {/* GRILLE DES BOUTONS D'URGENCE */}
          <div className={styles.grid}>
            {typesUrgence.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`${styles.typeCard} ${isSelected ? styles.typeCardSelected : ''}`}
                >
                  <div className={`${styles.iconWrapper} ${isSelected ? styles.iconWrapperSelected : ''}`}>
                    {type.icon}
                  </div>
                  <h3 className={styles.cardLabel}>{type.title}</h3>
                </div>
              );
            })}
          </div>

          {/* ZONE DE TEXTE */}
          <div className={styles.inputGroup}>
            <label className={styles.textareaLabel}>Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className={styles.textarea}
            />
          </div>

          {/* OPTIONS MÉDIAS */}
          <div className={styles.mediaGrid}>
            <button className={`${styles.btnMedia} ${styles.btnVoice}`}>
              <Mic className="w-4 h-4" /> Note vocale
            </button>
            <button className={styles.btnMedia}>
              <Camera className="w-4 h-4" /> Photo
            </button>
          </div>
        </div>

        {/* BOUTON D'ENVOI */}
        <div>
          <button onClick={() => navigate('/sos/confirmation')} className={styles.btnSubmit}>
            Envoyer le SOS
          </button>
        </div>

      </div>
    </div>
  );
}