"use client";

import React, { useState } from 'react';
import { MapPin, Navigation, Star, ShieldCheck } from 'lucide-react';

interface MapViewProps {
  workers: any[];
  center: { lat: number; lng: number };
  onWorkerClick: (worker: any) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapView({ workers, center, onWorkerClick, onMapClick }: MapViewProps) {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Reverse the simulation logic:
    // x = 50 + (lng - center.lng) * 1000  => lng = center.lng + (x - 50) / 1000
    // y = 50 - (lat - center.lat) * 1000  => lat = center.lat - (y - 50) / 1000
    
    const newLng = center.lng + (x - 50) / 1000;
    const newLat = center.lat - (y - 50) / 1000;
    
    onMapClick(newLat, newLng);
  };

  return (
    <div 
      className="w-full h-full bg-[#f8fafc] relative overflow-hidden flex items-center justify-center cursor-crosshair"
      onClick={handleBackgroundClick}
    >
      {/* Background Map Grid Effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:80px_80px]" />
      
      {/* The "Map" Surface */}
      <div className="relative w-full h-full">
        {/* Workers as Interactive Markers */}
        {workers.map((worker) => {
          // Calculate relative position based on lat/lng difference
          // This is a simulation: 0.1 degree = roughly 11km. 
          // We'll scale it so that ~0.05 degree diff spans the screen.
          const x = 50 + (worker.currentLng - center.lng) * 1000;
          const y = 50 - (worker.currentLat - center.lat) * 1000;

          // Only render if within visible range (simulated)
          if (x < -10 || x > 110 || y < -10 || y > 110) return null;

          return (
            <button 
              key={worker.id}
              className="absolute transition-all duration-500 transform hover:scale-110 group z-20"
              onClick={() => onWorkerClick(worker)}
              style={{ 
                left: `${x}%`, 
                top: `${y}%` 
              }}
            >
              <div className="relative">
                {/* Marker Pin */}
                <div className="flex flex-col items-center">
                   <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 shadow-xl group-hover:border-blue-500 transition-all">
                        <div className="w-full h-full bg-slate-100 rounded-[14px] overflow-hidden flex items-center justify-center">
                           {worker.photoUrl ? (
                             <img src={worker.photoUrl} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-slate-600 font-bold">{worker.user.name.charAt(0)}</span>
                           )}
                        </div>
                      </div>
                      
                      {/* Rating Badge */}
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-[#0a1128] text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                        <Star size={8} className="fill-current" />
                        {worker.rating?.toFixed(1) || "0.0"}
                      </div>

                      {/* Verified Badge */}
                      {worker.isVerified && (
                        <div className="absolute -bottom-1 -left-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-lg border border-[#0a1128]">
                          <ShieldCheck size={10} />
                        </div>
                      )}
                   </div>
                   
                   {/* Name Tag */}
                   <div className="mt-2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {worker.user.name}
                   </div>

                   {/* Pointer */}
                   <div className="w-px h-4 bg-gradient-to-b from-slate-300 to-transparent" />
                </div>
              </div>
            </button>
          );
        })}

        {/* Current Search Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-blue-500/10 rounded-full animate-ping" />
            <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" />
            <div className="relative p-3 bg-blue-500 rounded-full shadow-2xl shadow-blue-500/50 border-2 border-white">
              <Navigation size={24} className="text-white fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls (Simulated) */}
      <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-30">
        <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm">+</button>
        <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm">-</button>
      </div>

      <div className="absolute left-6 bottom-6 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 tracking-widest uppercase z-30 shadow-sm">
        Live AI Network Tracking
      </div>
    </div>
  );
}
