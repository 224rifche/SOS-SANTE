import React from 'react';

export default function Header() {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg text-white">
                DK
            </div>
            <div>
                <p className="text-xs text-white/80">Urgences - C.H.U Gabriel Touré</p>
                <h1 className="text-xl font-bold text-white">Dr. Koné</h1>
            </div>
        </div>
    );
}