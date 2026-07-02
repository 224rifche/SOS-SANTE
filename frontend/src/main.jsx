import App from "./App.jsx";
import React from 'react';
import { createRoot } from 'react-dom/client';
import "./styles/global.css";
// 👈 AJOUTE OU VÉRIFIE CETTE LIGNE ICI !
import { StrictMode } from "react";
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);