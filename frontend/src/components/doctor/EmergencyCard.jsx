import React from 'react';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';

export default function EmergencyCard({ patient }) {
    const severityStyles = {
        danger: { border: "border-l-4 border-l-red-500", bgIcon: "bg-red-50 text-red-500" },
        warning: { border: "border-l-4 border-l-orange-400", bgIcon: "bg-orange-50 text-orange-400" },
        success: { border: "border-l-4 border-l-green-500", bgIcon: "bg-green-50 text-green-500" },
    };

    const currentStyle = severityStyles[patient.severity] || severityStyles.success;

    return (
        <div className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 ${currentStyle.border} hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentStyle.bgIcon}`}>
                    {patient.severity === 'danger' && <Activity size={24} />}
                    {patient.severity === 'warning' && <ShieldAlert size={24} />}
                    {patient.severity === 'success' && <CheckCircle size={24} />}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                        {patient.name} - <span className="text-gray-500 font-normal">{patient.age} ans</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{patient.condition}</p>
                </div>
            </div>
            {patient.status && (
                <span className="text-xs font-bold text-red-500 animate-pulse bg-red-50 px-2 py-1 rounded-md">
                    {patient.status}
                </span>
            )}
        </div>
    );
}