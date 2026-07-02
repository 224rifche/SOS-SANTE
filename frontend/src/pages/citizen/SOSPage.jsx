import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. LIGNE AJOUTÉE ICI
import { Bell, MapPin, Heart, History, User, Home } from 'lucide-react';

export default function SOSPage() {
  const navigate = useNavigate(); // 2. LIGNE AJOUTÉE ICI

  const cards = [
    {
      id: 'position',
      title: 'Ma position',
      subtitle: 'Bamako, Hippodrome',
      icon: <MapPin className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
    },
    {
      id: 'proches',
      title: 'Mes proches',
      subtitle: '3 contacts d\'urgence',
      icon: <Heart className="w-5 h-5 text-red-500 fill-red-500" />,
      iconBg: 'bg-red-50',
    },
    {
      id: 'historique',
      title: 'Historique',
      subtitle: '2 alertes passées',
      icon: <History className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
    },
    {
      id: 'profil',
      title: 'Mon profil',
      subtitle: 'Groupe O+, allergies',
      icon: <User className="w-5 h-5 text-amber-500" />,
      iconBg: 'bg-amber-50',
    },
  ];

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-md bg-[#F8FAFC] flex flex-col justify-between p-6 sm:h-[90vh] sm:rounded-3xl sm:shadow-lg sm:border sm:border-gray-100 relative overflow-hidden">
        
        {/* EN-TÊTE */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-200">
              AD
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Bonjour,</p>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Awa Diallo</h2>
            </div>
          </div>
          <button className="p-3 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 shadow-sm relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>

        {/* BOUTON SOS CENTRAL */}
        <div className="flex flex-col items-center justify-center my-auto py-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-56 h-56 rounded-full bg-red-500/10 animate-pulse"></div>
            <div className="absolute w-48 h-48 rounded-full bg-red-500/20"></div>
            
            {/* 3. LE ONCLICK A ÉTÉ MODIFIÉ SUR CE BOUTON JUSTE ICI 👇 */}
            <button 
              onClick={() => navigate('/sos/localisation')}
              className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex flex-col items-center justify-center shadow-xl shadow-red-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white/10"
            >
              <span className="text-3xl font-extrabold tracking-wider mb-1">SOS</span>
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">Urgence</span>
            </button>
          </div>
          <p className="mt-6 text-xs text-gray-400 font-medium text-center">
            Appuyez en cas d'urgence médicale
          </p>
        </div>

        {/* ACCÈS RAPIDE */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Accès rapide</h3>
          <div className="grid grid-cols-2 gap-3.5">
            {cards.map((card) => (
              <div key={card.id} className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between min-h-[105px]">
                <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{card.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BARRE DE NAVIGATION */}
        <div className="bg-white -mx-6 -mb-6 px-6 py-3 border-t border-gray-100 flex items-center justify-between relative">
          <button className="flex flex-col items-center justify-center text-blue-600 w-12">
            <Home className="w-5 h-5 fill-blue-50/50" />
          </button>
          <button className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 w-12">
            <History className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 -top-5 -translate-x-1/2">
            <button className="w-12 h-12 bg-red-500 rounded-full text-white flex flex-col items-center justify-center text-[8px] font-bold shadow-md shadow-red-200 border-2 border-white">
              <span>SOS</span>
            </button>
          </div>
          <div className="w-12"></div>
          <button className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 w-12">
            <Heart className="w-5 h-5" />
          </button>
          <button className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 w-12">
            <User className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}