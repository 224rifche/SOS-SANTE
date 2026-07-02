import React from "react";
import { Users, Building2, Truck, Siren, TrendingUp } from "lucide-react";

/**
 * Screen 1 — Dashboard système
 * Reproduction fidèle du screenshot fourni.
 */
export default function Screen1_Dashboard() {
  const stats = [
    { label: "Utilisateurs", value: "1 248", icon: Users, iconColor: "text-slate-700" },
    { label: "Centres", value: "18", icon: Building2, iconColor: "text-emerald-600" },
    { label: "Ambulances", value: "42", icon: Truck, iconColor: "text-emerald-600" },
    { label: "Interv. / jour", value: "86", icon: Siren, iconColor: "text-red-500", labelColor: "text-red-500" },
  ];

  const chartData = [
    { day: "L", value: 35 },
    { day: "M", value: 30 },
    { day: "M", value: 22 },
    { day: "J", value: 38 },
    { day: "V", value: 70 },
    { day: "S", value: 95 },
    { day: "D", value: 40 },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-6">
      <div className="relative w-[320px] h-[660px] rounded-[2.5rem] bg-slate-900 shadow-2xl p-2">
        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-slate-50 flex flex-col">
          <div className="bg-slate-800 text-white px-5 pt-3 pb-2 flex items-center justify-between text-xs font-medium">
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

          <div className="bg-slate-800 text-white px-5 pb-5 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-300 leading-none mb-1">Administration système</p>
                <h1 className="text-lg font-bold leading-none">Supervision</h1>
              </div>
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[11px] font-medium px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Opérationnel
              </span>
            </div>
          </div>

          <div className="flex-1 px-4 -mt-2 pb-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 mt-3">
              {stats.map(({ label, value, icon: Icon, iconColor, labelColor }) => (
                <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    <span className={`text-[11px] font-medium ${labelColor ?? "text-slate-500"}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-slate-700">
                  Interventions · 7 jours
                </span>
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  12 %
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 h-28">
                {chartData.map((d, i) => {
                  const isPeak = d.value === maxValue;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full rounded-md ${isPeak ? "bg-slate-700" : "bg-slate-200"}`}
                        style={{ height: `${(d.value / maxValue) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/70" />
      </div>
    </div>
  );
}
