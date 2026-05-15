"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { Wrench, Plus, X, Star, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';

export default function SkillsManagementPage() {
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/workers/skills'),
        api.get('/users/me') // Assuming we include skills in /me or have a dedicated endpoint
      ]);
      setAllSkills(allRes.data);
      // For now we assume myRes.data.worker.skills exists
      setMySkills(myRes.data.worker?.skills || []);
    } catch (err) {
      console.error('Error fetching skills', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    setAdding(true);
    try {
      // In a real app, we'd have a POST /workers/me/skills
      // For this demo, we'll simulate the update
      const skillToAdd = allSkills.find(s => s.id === selectedSkill);
      if (skillToAdd && !mySkills.find(s => s.skillId === selectedSkill)) {
        // We'll update via the user update endpoint we created earlier
        const updatedSkills = [...mySkills.map(s => ({ skillId: s.skillId, level: s.level })), { skillId: selectedSkill, level: 1 }];
        await api.patch('/users/me', {
           worker: {
             skills: {
               upsert: updatedSkills.map(s => ({
                 where: { workerId_skillId: { workerId: 'current', skillId: s.skillId } },
                 update: { level: s.level },
                 create: { skillId: s.skillId, level: s.level }
               }))
             }
           }
        });
        await fetchData();
      }
      setSelectedSkill('');
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Professional Skills</h1>
        <p className="text-gray-400">Add your expertise to get discovered by providers and agencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Skill Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                 <Plus className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Add Expertise</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Select Skill</label>
                 <select 
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
                 >
                    <option value="" className="bg-[#0a0a0a]">Choose a category...</option>
                    {allSkills.map(skill => (
                      <option key={skill.id} value={skill.id} className="bg-[#0a0a0a]">{skill.name}</option>
                    ))}
                 </select>
              </div>
              <Button 
                onClick={handleAddSkill}
                disabled={adding || !selectedSkill}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-600/20"
              >
                {adding ? 'Adding...' : 'Add to My Profile'}
              </Button>
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
           <div className="space-y-4">
              <ShieldCheck className="text-purple-400" size={32} />
              <h3 className="text-lg font-bold text-white">Skill Verification</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Adding skills helps you rank higher in search results. Group leaders can add multiple skills to represent their agency's full capacity.
              </p>
           </div>
           <div className="flex items-center gap-2 text-xs text-amber-400 font-medium bg-amber-400/5 p-3 rounded-xl border border-amber-400/10 mt-6">
              <AlertCircle size={14} /> Only add skills you can professionally perform.
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Current Skills</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {mySkills.length === 0 ? (
             <div className="col-span-full py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <Wrench size={48} className="mx-auto text-gray-800 mb-4" />
                <p className="text-gray-500">No skills added yet.</p>
             </div>
           ) : (
             mySkills.map((item: any) => (
               <div key={item.skill.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-purple-500/50 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                        <Wrench size={18} />
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-sm">{item.skill.name}</h4>
                        <div className="flex gap-0.5 mt-1">
                           {[1,2,3,4,5].map(star => (
                             <Star key={star} size={10} className={star <= item.level ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
                           ))}
                        </div>
                     </div>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                     <Trash2 size={16} />
                  </button>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
