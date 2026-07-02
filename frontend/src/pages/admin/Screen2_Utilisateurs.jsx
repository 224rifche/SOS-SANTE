import React from "react";
import { ArrowLeft, Search } from "lucide-react";

/**
 * Screen 2 — Utilisateurs
 * Reproduction fidèle du screenshot fourni.
 */
export default function Screen2_Utilisateurs() {
  const users = [
    {
      initials: "MT",
      name: "Moussa Traoré",
      role: "Ambulancier · NE-07",
      status: "Actif",
      avatarBg: "bg-blue-100",
      avatarText: "text-blue-600",
    },
    {
      initials: "DK",
      name: "Dr. Koné",
      role: "Médecin · CHU G. Touré",
      status: "Actif",
      avatarBg: "bg-teal-100",
      avatarText: "text-teal-600",
    },
    {
      initials: "FB",
      name: "Fatou Ba",
      role: "Régulateur · Bamako",
      status: "Actif",
      avatarBg: "bg-purple-100",
      avatarText: "text-purple-600",
    },
    {
      initials: "SD",
      name: "Sory Diarra",
      role: "Citoyen",
      status: "Suspendu",
      avatarBg: "bg-slate-100",
      avatarText: "text-slate-500",
    },
  ];

  const statusStyles = {
    Actif: "bg-emerald-50 text-emerald-600",
    Suspendu: "bg-amber-50 text-amber-600",
  };

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
            <h1 className="text-xl font-bold text-slate-900">Utilisateurs</h1>
          </div>

          <div className="px-4 mb-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="flex-1 text-sm text-slate-600 placeholder:text-slate-400 outline-none bg-transparent"
                readOnly
              />
            </div>
          </div>

          <div className="flex-1 px-4 overflow-y-auto flex flex-col gap-2.5 pb-6">
            {users.map((u) => (
              <div
                key={u.name}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${u.avatarBg} ${u.avatarText}`}
                >
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.role}</p>
                </div>
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyles[u.status]}`}
                >
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-slate-900/70" />
      </div>
    </div>
  );
}
