import React from 'react';
// On remonte de 2 dossiers (doctor puis pages) pour aller chercher les composants et les données
import Header from '../../components/doctor/Header';
import Stats from '../../components/doctor/Stats';
import EmergencyCard from '../../components/doctor/EmergencyCard';
import { patientsData } from '../../Data/Patients.js';

export default function DoctorDashboard() {
    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased md:py-10">
            <div className="mx-auto max-w-md bg-white min-h-screen shadow-none md:max-w-5xl md:min-h-[800px] md:rounded-3xl md:shadow-xl overflow-hidden flex flex-col justify-between">
                <div>
                    {/* Top Banner (Vert) */}
                    <div className="bg-[#007A78] p-6 rounded-b-3xl md:rounded-t-3xl md:rounded-b-none md:p-8">
                        <Header />
                        <Stats />
                    </div>

                    {/* Liste Patients */}
                    <div className="p-6 md:p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 md:text-xl">Urgences entrantes</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {patientsData.map((patient) => (
                                <EmergencyCard key={patient.id} patient={patient} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Mobile */}
                <div className="text-center py-4 bg-gray-50 border-t text-xs font-semibold text-gray-500 md:hidden">
                    Dashboard médecin
                </div>
            </div>
        </div>
    );
}