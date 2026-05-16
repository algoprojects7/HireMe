"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Briefcase, ChevronLeft, Zap, Layers, Navigation, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { GUWAHATI_AREAS, findLocation } from '@/lib/location';
import WorkerModal from '@/components/search/WorkerModal';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const LiveMapView = dynamic(() => import('@/components/search/LiveMapView'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
});

export default function MapSearchPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 26.1445, lng: 91.7362 });
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillHints, setShowSkillHints] = useState(false);
  const [showLocationHints, setShowLocationHints] = useState(false);

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

    if (skillSearch && !selectedSkill) {
      const matchedSkill = skills.find(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()));
      if (matchedSkill) {
        setSelectedSkill(matchedSkill.id);
        setSkillSearch(matchedSkill.name);
      }
    }

    setShowSkillHints(false);
    setShowLocationHints(false);
  };

  // AI-based Fuzzy Search Algorithm
  const smartSearch = (query: string, target: string) => {
    if (!query) return true;
    const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (t.includes(q)) return true;
    
    let qIdx = 0;
    for (let i = 0; i < t.length && qIdx < q.length; i++) {
      if (t[i] === q[qIdx]) qIdx++;
    }
    return qIdx === q.length;
  };

  // AI Context: Only suggest skills and locations where providers actually exist
  const availableSkillIds = new Set(workers.flatMap(w => w.skills?.map((s: any) => s.skillId) || []));
  const dynamicSkills = skills.filter(s => availableSkillIds.has(s.id));
  
  const isWorkerNearLocation = (loc: any) => {
    return workers.some(w => {
      if (!w.currentLat || !w.currentLng) return false;
      const dLat = w.currentLat - loc.lat;
      const dLng = w.currentLng - loc.lng;
      return Math.sqrt(dLat*dLat + dLng*dLng) < 0.05; // Provider must be within ~5km radius
    });
  };
  const dynamicLocations = GUWAHATI_AREAS.filter(loc => isWorkerNearLocation(loc));

  const filteredSkills = dynamicSkills.filter(s => smartSearch(skillSearch, s.name));
  const filteredLocations = dynamicLocations.filter(loc => smartSearch(locationQuery, loc.name));

  const filteredWorkers = workers.filter(worker => {
    if (selectedSkill === 'others') return worker.id.length % 2 === 0;
    if (selectedSkill && !worker.skills.some((s: any) => s.skillId === selectedSkill)) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-screen w-screen bg-white overflow-hidden flex flex-col font-poppins">
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="absolute top-0 left-0 right-0 z-[100] p-6 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-4 pointer-events-auto">
          <div className="flex gap-4">
            <Link href="/" className="h-14 w-14 bg-white backdrop-blur-xl border border-gray-200 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all shrink-0 shadow-2xl">
               <ChevronLeft size={24} />
            </Link>

            <div className="flex-1 flex flex-col md:flex-row gap-2 p-2 bg-white/90 backdrop-blur-3xl border border-gray-200 rounded-3xl shadow-2xl">
              <div className="flex-1 relative border-b md:border-b-0 md:border-r border-gray-200 md:pr-2">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Jalukbari)" 
                  value={locationQuery}
                  onFocus={() => setShowLocationHints(true)}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       const bestMatch = filteredLocations[0];
                       if (bestMatch) {
                         setMapCenter({ lat: bestMatch.lat, lng: bestMatch.lng });
                         setLocationQuery(bestMatch.name);
                         setShowLocationHints(false);
                       } else {
                         handleSearch();
                       }
                    }
                  }}
                  className="w-full bg-transparent pl-14 pr-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />

                <AnimatePresence>
                  {showLocationHints && locationQuery && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">AI Suggestions</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {filteredLocations.map((loc, idx) => (
                          <button 
                            key={idx}
                            onMouseDown={(e) => { 
                              e.preventDefault(); // Prevent input onBlur if we ever add one
                              setMapCenter({ lat: loc.lat, lng: loc.lng });
                              setLocationQuery(loc.name); 
                              setShowLocationHints(false); 
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-600 flex items-center gap-2 border-b border-gray-50 last:border-0"
                          >
                            <Navigation size={14} className="text-blue-500" />
                            {loc.name}
                          </button>
                        ))}
                        {filteredLocations.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 italic">No locations found.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 relative md:pl-2">
                <Briefcase className="absolute left-7 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Skill (Plumber, Electrician...)" 
                  value={skillSearch}
                  onFocus={() => setShowSkillHints(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    if (e.target.value === '') setSelectedSkill('');
                  }}
                  className="w-full bg-transparent pl-16 pr-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                
                <AnimatePresence>
                  {showSkillHints && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                    >
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-600" />
                        <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest">AI Intelligence</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <button 
                          onMouseDown={(e) => { 
                            e.preventDefault();
                            setSelectedSkill(''); 
                            setSkillSearch('All Workers'); 
                            setShowSkillHints(false); 
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-600 font-bold flex items-center gap-2 border-b border-gray-50"
                        >
                          <Layers size={14} className="text-blue-500" />
                          All Workers
                        </button>
                        {filteredSkills.map(skill => (
                          <button 
                            key={skill.id}
                            onMouseDown={(e) => { 
                              e.preventDefault();
                              setSelectedSkill(skill.id); 
                              setSkillSearch(skill.name); 
                              setShowSkillHints(false); 
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-600 flex items-center gap-2 border-b border-gray-50 last:border-0"
                          >
                            <Zap size={14} className="text-amber-500" />
                            {skill.name}
                          </button>
                        ))}
                        <button 
                          onMouseDown={(e) => { 
                            e.preventDefault();
                            setSelectedSkill('others'); 
                            setSkillSearch('Others'); 
                            setShowSkillHints(false); 
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-600 flex items-center gap-2"
                        >
                          <Zap size={14} className="text-purple-500" />
                          Others
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Zap size={16} />
                Search
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
               <p className="text-gray-500 font-bold text-sm tracking-widest animate-pulse">Initializing AI Network...</p>
            </div>
          </div>
        ) : (
          <>
            {(showSkillHints || showLocationHints) && (
              <div className="absolute inset-0 z-[55] cursor-default" onClick={() => { setShowSkillHints(false); setShowLocationHints(false); }} />
            )}
            <LiveMapView 
              workers={filteredWorkers} 
              center={mapCenter} 
              onWorkerClick={(w) => setSelectedWorker(w)} 
              onMapClick={(lat, lng) => {
                setMapCenter({ lat, lng });
                setLocationQuery("Selected Area");
                setShowSkillHints(false);
              }}
            />
          </>
        )}
        
        <div className="absolute top-32 right-6 flex flex-col gap-3">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 p-4 rounded-3xl shadow-xl">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nearby Professionals</p>
             <p className="text-2xl font-black text-gray-900">{filteredWorkers.length}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 p-4 rounded-3xl shadow-xl">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Area</p>
             <p className="text-sm font-bold text-blue-600 flex items-center gap-1">
               <Navigation size={12} className="fill-current" />
               {findLocation(locationQuery)?.name || "Guwahati Metro"}
             </p>
          </div>
        </div>
      </main>

      {selectedWorker && (
        <WorkerModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
      )}

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-md border border-gray-100 rounded-full z-40 pointer-events-none shadow-lg">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
           <div className="w-2 h-2 rounded-full bg-blue-500" /> Individual
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
           <div className="w-2 h-2 rounded-full bg-purple-500" /> Group Leader
        </div>
      </div>
    </div>
  );
}
