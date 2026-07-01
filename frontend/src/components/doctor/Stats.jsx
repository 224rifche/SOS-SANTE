import React from 'react';

export default function Stats() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm text-white">
                <span className="block text-3xl font-bold mb-1">3</span>
                <span className="text-xs text-white/90">Urgences en attente</span>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm text-white">
                <span className="block text-3xl font-bold mb-1">8</span>
                <span className="text-xs text-white/90">Lits disponibles</span>
            </div>
        </div>
    );
}