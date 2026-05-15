"use client";

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapViewProps {
  workers: any[];
  center?: { lat: number; lng: number };
  onWorkerClick?: (worker: any) => void;
}

export function MapView({ workers, center = { lat: 26.1445, lng: 91.7362 } }: MapViewProps) {
  return (
    <div className="w-full h-[500px] bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center">
      {/* Background Map Grid Effect */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* Markers */}
      <div className="relative z-10 w-full h-full">
        {workers.map((worker) => (
          <div 
            key={worker.id}
            className="absolute transition-all transform hover:scale-110 cursor-pointer group"
            onClick={() => onWorkerClick?.(worker)}
            style={{ 
              left: `${50 + (worker.currentLng - center.lng) * 2000}%`, 
              top: `${50 - (worker.currentLat - center.lat) * 2000}%` 
            }}
          >
            <div className={`w-10 h-10 rounded-full border-2 shadow-xl overflow-hidden bg-white flex items-center justify-center transition-all ${
              worker.groupSize > 1 ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-blue-500'
            }`}>
              {worker.photoUrl ? (
                <img src={worker.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs font-bold text-blue-500">{worker.user.name.charAt(0)}</div>
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <div className="bg-[#0a0a0a] border border-white/10 p-2 rounded-lg text-xs shadow-xl">
                <p className="text-white font-semibold">{worker.user.name}</p>
                <p className="text-gray-400">{worker.skills[0]?.skill.name}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-red-500/20 rounded-full border border-red-500/50">
          <Navigation size={20} className="text-red-400" />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-[#0a0a0a]/80 backdrop-blur-md p-3 rounded-lg border border-white/10 text-[10px] text-gray-500">
        AI-Powered Live Tracking (Simulation)
      </div>
    </div>
  );
}
