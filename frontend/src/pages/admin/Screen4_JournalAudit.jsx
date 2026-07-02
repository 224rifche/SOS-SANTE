import React from "react";
import { ArrowLeft, Check, Truck, Siren, Lock, LogIn } from "lucide-react";

/**
 * Screen 4 — Journal d'audit
 * Reproduction fidèle du screenshot fourni.
 */
export default function Screen4_JournalAudit() {
  const events = [
    {
      icon: Check,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Intervention #NE-2481 clôturée",
      meta: "Dr. Koné · 09:52",
    },
    {
      icon: Truck,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Ambulance NE-07 affectée",
      meta: "Fatou Ba · 09:42",
    },
    {
      icon: Siren,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      title: "Nouvelle alerte SOS créée",
      meta: "Awa Diallo · 08:41",
      isBadgeIcon: true,
    },
    {
      icon: Lock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Compte « Sory Diarra » suspendu",
      meta: "Admin · 08:15",
    },
    {
      icon: LogIn,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "Connexion régulateur Bamako",
      meta: "Fatou Ba · 07:58",
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-6">
      <div className="relative w-[320px] h-[660px] rounded-[2.5rem] bg-slate-900 shadow-2xl p-2">
        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-slate-50 flex flex-col">
          <div className="bg-white text-slate-900 px-5 pt-3 pb-1 flex items-center justify-between text-xs font-medium">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="0.5" />
                <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" />
                <rect x="9" y="3" width="3" height="9" rx="0.5" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
              </svg>
              <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
                <path d="M7.5 10.5c.6 0 1 .5 1 1s-.4 1-1 1-1-.5-1-1 .4-1 1-1zM3 6.5c1.2-1 2.8-1.6 4.5-1.6s3.3.6 4.5 1.6l-1.2 1.4c-.9-.8-2-1.2-3.3-1.2s-2.4.4-3.3 1.2L3 6.5zM0.5 3c2-1.6 4.5-2.5 7-2.5s5 .9 7 2.5L12.8 4.5C11.2 3.2 9.4 2.6 7.5 2.6S3.8 3.2 2.2 4.5L0.5 3z" />
              </svg>
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="currentColor" />
                <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
                <rect x="19" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 pt-2 pb-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Journal d'audit</h1>
          </div>

          <div className="flex-1 px-4 overflow-y-auto pb-6">
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
              {events.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${e.iconBg}`}
                  >
                    {e.isBadgeIcon ? (
                      <span className={`text-[8px] font-bold ${e.iconColor}`}>SOS</span>
                    ) : (
                      <e.icon className={`w-4 h-4 ${e.iconColor}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 leading-snug">
                      {e.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{e.meta}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full text-center text-[12px] font-medium text-blue-500 mt-4">
              Voir l'historique complet
            </button>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-slate-900/70" />
      </div>
    </div>
  );
}
