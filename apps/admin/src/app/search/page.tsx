"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Search as SearchIcon, Filter, MapPin, Star, ShieldCheck, ArrowRight, Briefcase, Zap } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function PublicSearchPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');

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

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.skills.some((s: any) => s.skill.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkill = selectedSkill ? worker.skills.some((s: any) => s.skillId === selectedSkill) : true;
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Search Section */}
        <div className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Find the Perfect <span className="text-[#f5c518]">Worker</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Browse thousands of verified professionals near you. Real ratings, secure payments, and AI-powered matching.
            </p>

            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or service (e.g. Plumber, Electrician)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-4 focus:outline-none text-white placeholder:text-gray-600"
                />
              </div>
              <div className="w-px bg-white/10 hidden md:block" />
              <select 
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-transparent px-6 py-4 focus:outline-none text-gray-300 border-none cursor-pointer"
              >
                <option value="" className="bg-[#0a0a0a]">All Skills</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id} className="bg-[#0a0a0a]">{skill.name}</option>
                ))}
              </select>
              <button className="bg-[#f5c518] text-[#0a1128] px-8 py-4 rounded-2xl font-bold hover:bg-[#e6b800] transition-all flex items-center justify-center gap-2">
                <Zap size={18} />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={20} className="text-blue-400" />
              {loading ? 'Searching...' : `${filteredWorkers.length} Workers Available`}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Sort by:</span>
              <select className="bg-transparent text-white font-bold focus:outline-none border-none cursor-pointer">
                <option value="rating" className="bg-[#0a0a0a]">Top Rated</option>
                <option value="proximity" className="bg-[#0a0a0a]">Nearest</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] bg-white/5 rounded-3xl border border-white/5 animate-pulse" />
              ))
            ) : filteredWorkers.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500 text-lg">No workers found matching your criteria.</p>
                <button onClick={() => {setSearchQuery(''); setSelectedSkill('');}} className="mt-4 text-blue-400 hover:underline font-bold">Clear all filters</button>
              </div>
            ) : (
              filteredWorkers.map((worker) => (
                <div key={worker.id} className="group bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-full">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-600">
                      {worker.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{worker.user.name}</h3>
                      <div className="flex items-center gap-1.5 text-[#f5c518] text-sm font-bold">
                        <Star size={14} className="fill-current" />
                        {worker.rating?.toFixed(1) || "0.0"} 
                        <span className="text-gray-500 font-medium ml-1">({worker.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {worker.skills.map((s: any) => (
                      <span key={s.skillId} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:border-blue-500/20 group-hover:text-blue-300 transition-all">
                        {s.skill.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin size={14} /> New Delhi, India
                      </div>
                      <div className="text-emerald-400 font-bold">Available Now</div>
                    </div>

                    <Link href={`/p/${worker.userId}`} className="w-full">
                      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                        View Profile
                        <ArrowRight size={16} />
                      </button>
                    </Link>
                    
                    <Link href="/auth/register?type=customer" className="w-full block">
                      <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
