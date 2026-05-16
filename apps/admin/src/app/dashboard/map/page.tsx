"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { MapView } from '@repo/ui';
import { Search, MapPin, Navigation, Filter, Briefcase, PhoneOff, MessageSquare, Phone, Users, LogIn, Zap, Star, Target } from 'lucide-react';
import { Button } from '@repo/ui';
import { useAuthStore } from '@/store/useAuthStore';

const GUWAHATI_AREAS = [
  { name: 'Hatigaon', lat: 26.1364, lng: 91.7823 },
  { name: 'Bhangagarh', lat: 26.1645, lng: 91.7662 },
  { name: 'Ganeshguri', lat: 26.1511, lng: 91.7811 },
  { name: 'Noonmati', lat: 26.1834, lng: 91.7923 },
  { name: 'Beltola', lat: 26.1264, lng: 91.7923 },
  { name: 'Basistha', lat: 26.1064, lng: 91.7823 },
  { name: 'Dispur', lat: 26.1432, lng: 91.7912 },
  { name: 'Zoo Road', lat: 26.1682, lng: 91.7812 },
  { name: 'Sundarbari', lat: 26.1512, lng: 91.6812 },
  { name: 'Jalukbari', lat: 26.1412, lng: 91.6612 },
  { name: 'Adabari', lat: 26.1612, lng: 91.6912 },
  { name: 'Khanapara', lat: 26.1112, lng: 91.8212 },
];

export default function WorkerMapPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [workers, setWorkers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState(GUWAHATI_AREAS[0]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
    
    // Resume booking intent if it exists and user just logged in
    const intent = localStorage.getItem('booking_intent');
    if (intent && user) {
       const data = JSON.parse(intent);
       localStorage.removeItem('booking_intent');
       setSelectedWorker(data.worker);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkers();
  }, [selectedArea, selectedSkill]);

  const handleAction = (action: string) => {
    if (!user) {
      localStorage.setItem('booking_intent', JSON.stringify({
        worker: selectedWorker,
        skillId: selectedSkill,
        area: selectedArea.name,
        action
      }));
      router.push('/auth/login?redirect=/dashboard/map&reason=auth_required');
      return;
    }
    alert(`${action} initiated for ${selectedWorker.user.name}`);
  };

  const runAIMatch = async () => {
    if (!selectedSkill) {
      alert('Please select a skill first to run AI Matching.');
      return;
    }
    setShowAI(true);
    setAiLoading(true);
    try {
      const res = await api.get('/workers/match', {
        params: {
          skillId: selectedSkill,
          lat: selectedArea.lat,
          lng: selectedArea.lng,
          limit: 5,
        },
      });
      setAiMatches(res.data);
    } catch (err) {
      console.error('AI match error', err);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/workers/skills');
      setSkills(response.data);
    } catch (err) {
      console.error('Error fetching skills', err);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workers/search', {
        params: { skillId: selectedSkill || undefined }
      });
      setWorkers(response.data);
    } catch (err) {
      console.error('Error searching workers', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Live Worker Tracking</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Real-time tracking and discovery of workers in Guwahati. 
            <span className="text-blue-400 ml-1 font-medium">This platform is strictly free from gender, religion, and community bias.</span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="" className="bg-[#0a0a0a]">All Skills</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id} className="bg-[#0a0a0a]">{skill.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select
              value={selectedArea.name}
              onChange={(e) => setSelectedArea(GUWAHATI_AREAS.find(a => a.name === e.target.value)!)}
              className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              {GUWAHATI_AREAS.map(area => (
                <option key={area.name} value={area.name} className="bg-[#0a0a0a]">{area.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={runAIMatch}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold flex items-center gap-2">
            <Zap size={16} /> AI Match
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white">
            <Navigation size={18} className="mr-2" /> Recenter
          </Button>
        </div>
      </div>

      {/* AI Match Results Panel */}
      {showAI && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Zap size={18} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AI Worker Matching Results</h3>
                <p className="text-[10px] text-gray-500">Ranked by: 50% Proximity · 40% Proficiency · 10% Group Leader Bonus</p>
              </div>
            </div>
            <button onClick={() => setShowAI(false)} className="text-gray-600 hover:text-white text-xs transition-colors">
              ✕ Close
            </button>
          </div>

          {aiLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-400 text-sm">Calculating best matches...</span>
            </div>
          ) : aiMatches.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-6">No matching workers found. Try a different skill or area.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {aiMatches.map((w: any, i: number) => (
                <div
                  key={w.id}
                  onClick={() => { setSelectedWorker(w); setShowAI(false); }}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-2xl cursor-pointer transition-all space-y-3"
                >
                  {/* Rank badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                      i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-white/10'
                    }`}>
                      #{i + 1}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400">
                      <Target size={10} />
                      {w._score}pts
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-white font-bold text-sm truncate">{w.user?.name}</p>
                    {w.isGroupLeader && (
                      <span className="text-[9px] text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                        GROUP LEADER
                      </span>
                    )}
                  </div>

                  {/* Skill */}
                  <p className="text-[10px] text-blue-400 font-medium">
                    {w.skills?.[0]?.skill?.name ?? 'General'}
                  </p>

                  {/* Distance & Score bars */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Distance</span>
                      <span className="text-white">{w._distanceKm} km</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Skill Level</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className={`w-2 h-2 rounded-sm ${
                            n <= (w.skills?.[0]?.level ?? 0) ? 'bg-blue-400' : 'bg-white/10'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAction('Hire'); }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-xl font-bold"
                  >
                    Hire Now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Map Area */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">
          <MapView 
            workers={workers} 
            center={selectedArea} 
            onWorkerClick={setSelectedWorker}
          />
          
          {/* Overlay Search */}
          <div className="absolute top-6 left-6 w-72">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by skill or area..." 
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 overflow-y-auto space-y-6">
          {selectedWorker ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/10 overflow-hidden mb-4">
                  {selectedWorker.photoUrl ? (
                    <img src={selectedWorker.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                      {selectedWorker.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{selectedWorker.user.name}</h3>
                <p className="text-gray-500 text-[10px] font-mono mt-1">ID: {selectedWorker.id}</p>
                
                {selectedWorker.groupSize > 1 ? (
                  <div className="mt-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg inline-flex items-center gap-2">
                    <Users size={12} className="text-purple-400" />
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Group Leader • {selectedWorker.groupSize} Workers</span>
                  </div>
                ) : (
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-2">
                    {selectedWorker.skills[0]?.skill.name || 'Individual Worker'}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Location Status</p>
                  <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Currently in {selectedArea.name}
                  </p>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3">
                  <PhoneOff size={18} className="text-amber-400" />
                  <p className="text-xs text-amber-400/80 leading-relaxed">
                    Mobile number is hidden for privacy. You can communicate via secure messaging.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button 
                  onClick={() => handleAction('Message')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <MessageSquare size={18} className="mr-2" /> Message
                </Button>
                <Button 
                  onClick={() => handleAction('Call')}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <Phone size={18} className="mr-2" /> Call App
                </Button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs">
                  Report Issue to Admin
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                <MapPin size={32} />
              </div>
              <div>
                <p className="text-white font-semibold">No Worker Selected</p>
                <p className="text-gray-500 text-xs mt-1 px-4">Click on a map marker to view worker details and contact them.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
