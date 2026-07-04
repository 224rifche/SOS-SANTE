import React from "react";
import { ArrowLeft, TrendingDown, TrendingUp, Download, ChevronRight } from "lucide-react";

/**
 * Screen 3 — Statistiques
 * Reproduction fidèle du screenshot fourni.
 */
export default function Screen3_Statistiques() {
  const urgencyTypes = [
    { label: "Cardiaque", value: 34, color: "bg-red-500" },
    { label: "Accident / trauma", value: 28, color: "bg-amber-400" },
    { label: "Respiratoire", value: 21, color: "bg-blue-800" },
    { label: "Autres", value: 17, color: "bg-slate-400" },
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
            <h1 className="text-xl font-bold text-slate-900">Statistiques</h1>
          </div>

          <div className="flex-1 px-4 overflow-y-auto pb-6 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] text-slate-400 leading-tight mb-2">
                  Temps moyen<br />d'intervention
                </p>
                <p className="text-xl font-bold text-emerald-600 mb-1">11:24</p>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-500">
                  <TrendingDown className="w-3 h-3" />
                  8 % ce mois
                </span>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] text-slate-400 leading-tight mb-2">
                  Taux de prise en charge
                </p>
                <p className="text-xl font-bold text-slate-800 mb-1">96,4 %</p>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  2 %
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-[13px] font-semibold text-slate-700 mb-4">
                Répartition par type d'urgence
              </p>
              <div className="flex flex-col gap-3.5">
                {urgencyTypes.map((t) => (
                  <div key={t.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-slate-600">{t.label}</span>
                      <span className="text-[12px] font-semibold text-slate-700">{t.value} %</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full ${t.color}`}
                        style={{ width: `${t.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm text-left">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-800">
                  Exporter le rapport mensuel
                </p>
                <p className="text-[11px] text-slate-400">PDF · CSV</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-slate-900/70" />
      </div>
    </div>
  );
}
