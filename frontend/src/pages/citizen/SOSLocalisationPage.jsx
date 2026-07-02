import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icône Leaflet pour Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function SOSLocalisationPage() {
  const navigate = useNavigate();
  const position = [12.6392, -8.0029]; // Bamako Hippodrome

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-md bg-white flex flex-col justify-between sm:h-[90vh] sm:rounded-3xl sm:shadow-lg sm:border sm:border-gray-100 relative overflow-hidden">
        
        {/* BOUTON RETOUR */}
        <div className="absolute top-4 left-4 z-[1000]">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl bg-white shadow-md border border-gray-100 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* LA CARTE */}
        <div className="absolute inset-0 w-full h-full z-0">
          <MapContainer center={position} zoom={15} zoomControl={false} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
            <Marker position={position} />
          </MapContainer>
        </div>

        {/* PANNEAU INFÉRIEUR */}
        <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-[32px] p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-[1000] flex flex-col gap-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-2 mb-1"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Position confirmée</h3>
                <p className="text-[11px] text-gray-400 font-medium">Précision GPS ± 5 m</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
            <div className="p-2 bg-red-50 rounded-xl mt-0.5 flex-shrink-0"><MapPin className="w-4 h-4 text-red-500" /></div>
            <div>
              <h4 className="text-xs font-bold text-gray-800">Quartier Hippodrome, Bamako</h4>
              <p className="text-[10px] text-gray-400 font-mono">12.6392° N · 8.0029° O — Rue 224, porte 87</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/sos/details')} // Redirige vers l'étape suivante
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            Continuer la localisation
          </button>
        </div>
      </div>
    </div>
  );
}