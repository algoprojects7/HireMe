"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Briefcase, ChevronLeft, Zap, Layers, Navigation } from 'lucide-react';
import { MapView } from '@repo/ui';
import api from '@/lib/api';
import { GUWAHATI_AREAS, findLocation } from '@/lib/location';
import WorkerSideSheet from '@/components/search/WorkerSideSheet';
import Link from 'next/link';

export default function MapSearchPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search States
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 26.1445, lng: 91.7362 });
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, skillsRes] = await Promise.all([
          api.get('/workers/search'),
          api.get('/workers/skills')
        ]);
        setWorkers(workersRes.data);
        setSkills(skillsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (locationQuery) {
      const area = findLocation(locationQuery);
      if (area) {
        setMapCenter({ lat: area.lat, lng: area.lng });
      }
    }
  };

  const filteredWorkers = workers.filter(worker => {
    if (selectedSkill && !worker.skills.some((s: any) => s.skillId === selectedSkill)) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col font-poppins">
      {/* Header / Search Bar */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 pointer-events-none">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 pointer-events-auto">
          {/* Logo / Back */}
          <Link href="/" className="h-14 w-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all shrink-0">
             <ChevronLeft size={24} />
          </Link>

          {/* Dual Input Search Container */}
          <div className="flex-1 flex flex-col md:flex-row gap-2 p-2 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50">
            {/* Location Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
              <input 
                type="text" 
                placeholder="Search area (e.g. Jalukbari)..." 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
            
            <div className="w-px bg-white/10 hidden md:block" />

            {/* Skills Dropdown */}
            <div className="flex-1 relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
              <select 
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-transparent pl-12 pr-8 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0a0a0a]">All Skills</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id} className="bg-[#0a0a0a]">{skill.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Main Map View */}
      <main className="flex-1 relative">
        <MapView 
          workers={filteredWorkers} 
          center={mapCenter} 
          onWorkerClick={(w) => setSelectedWorker(w)} 
        />
        
        {/* Floating Quick Stats */}
        <div className="absolute top-32 right-6 flex flex-col gap-3">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-xl">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nearby Professionals</p>
             <p className="text-2xl font-black text-white">{filteredWorkers.length}</p>
          </div>
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-xl">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Area</p>
             <p className="text-sm font-bold text-blue-400 flex items-center gap-1">
               <Navigation size={12} className="fill-current" />
               {findLocation(locationQuery)?.name || "Guwahati Metro"}
             </p>
          </div>
        </div>
      </main>

      {/* Side Sheet */}
      {selectedWorker && (
        <WorkerSideSheet 
          worker={selectedWorker} 
          onClose={() => setSelectedWorker(null)} 
        />
      )}

      {/* Legend / Overlay */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 rounded-full z-40 pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
           <div className="w-2 h-2 rounded-full bg-blue-500" /> Individual
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
           <div className="w-2 h-2 rounded-full bg-purple-500" /> Group Leader
        </div>
      </div>
    </div>
  );
}
