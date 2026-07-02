import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { ArrowLeft, Car, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './SOSSuiviPage.module.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const userIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const ambulanceIcon = L.divIcon({
  html: `<div style="background-color: #2563eb; padding: 6px; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display:flex;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7h1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export default function SOSSuiviPage() {
  const navigate = useNavigate();

  const userPos = [12.6392, -8.0029];
  const ambulancePos = [12.6460, -7.9940];
  const polylineCoords = [userPos, ambulancePos];

  const timelineSteps = [
    { id: 1, title: 'Alerte envoyée', desc: '09:41', status: 'done' },
    { id: 2, title: 'Validée par le régulateur', desc: '09:41', status: 'done' },
    { id: 3, title: 'Ambulance affectée', desc: '09:42 · Équipe NE-07', status: 'done' },
    { id: 4, title: 'En route vers vous', desc: 'Arrivée estimée 09:48', status: 'current' },
    { id: 5, title: 'Prise en charge sur place', desc: '', status: 'upcoming' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.backButtonWrapper}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className={styles.mapWrapper}>
          <MapContainer center={[12.6425, -7.9985]} zoom={14} zoomControl={false} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM' />
            <Marker position={userPos} icon={userIcon} />
            <Marker position={ambulancePos} icon={ambulanceIcon} />
            <Polyline positions={polylineCoords} pathOptions={{ color: '#2563eb', weight: 3, dashArray: '6, 6' }} />
          </MapContainer>
        </div>

        <div className={styles.panel}>
          <div className={styles.banner}>
            <div className={styles.bannerLeft}>
              <div className={styles.bannerIcon}>
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className={styles.bannerTitle}>Ambulance en route</h3>
                <p className={styles.bannerSubtitle}>Équipe NE-07 · 2,3 km</p>
              </div>
            </div>
            <div className={styles.bannerRight}>
              <span className={styles.timeNumber}>6</span>
              <span className={styles.timeUnit}>min</span>
            </div>
          </div>

          <div className={styles.timelineSection}>
            <h4 className={styles.sectionTitle}>Suivi de l'intervention</h4>
            <div className={styles.timeline}>
              {timelineSteps.map((step) => (
                <div key={step.id} className={styles.step}>
                  <div className={styles.badge}>
                    {step.status === 'done' && <CheckCircle2 className={`w-5 h-5 ${styles.badgeDone}`} />}
                    {step.status === 'current' && <div className={styles.badgeCurrent}><div className={styles.pulsePoint} /></div>}
                    {step.status === 'upcoming' && <div className={styles.badgeUpcoming} />}
                  </div>
                  <div>
                    <h5 className={`${styles.stepTitle} ${step.status === 'current' ? styles.stepTitleCurrent : step.status === 'upcoming' ? styles.stepTitleUpcoming : ''}`}>
                      {step.title}
                    </h5>
                    {step.desc && <p className={styles.stepDesc}>{step.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}