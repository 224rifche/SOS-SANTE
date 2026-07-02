import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/citizen/HomePage'; // 👈 On ajoute la page d'accueil
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import SOSPage from '../pages/citizen/SOSPage';
import SOSLocalisationPage from '../pages/citizen/SOSLocalisationPage';
import UrgenceDetailsPage from '../pages/citizen/UrgenceDetailsPage';
import SOSConfirmationPage from '../pages/citizen/SOSConfirmationPage';
import SOSSuiviPage from '../pages/citizen/SOSSuiviPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Page d'accueil explicative à la racine */}
      <Route path="/" element={<HomePage />} />

      {/* Routes d'authentification */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Parcours d'urgence Citoyen */}
      <Route path="/sos" element={<SOSPage />} />
      <Route path="/sos/localisation" element={<SOSLocalisationPage />} />
      <Route path="/sos/details" element={<UrgenceDetailsPage />} />
      <Route path="/sos/confirmation" element={<SOSConfirmationPage />} />
      <Route path="/sos/suivi" element={<SOSSuiviPage />} />

      {/* Route par défaut : Redirige vers l'accueil si l'URL n'existe pas */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}