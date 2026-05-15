"use client";

import React from 'react';
import { X, Star, Phone, MessageSquare, ShieldCheck, MapPin, Briefcase, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface WorkerSideSheetProps {
  worker: any;
  onClose: () => void;
}

export default function WorkerSideSheet({ worker, onClose }: WorkerSideSheetProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleAction = (action: 'call' | 'message') => {
    if (!user) {
      router.push('/auth/login?redirect=/search');
      return;
    }
    // Proceed with action (In demo, we just alert)
    alert(`${action.toUpperCase()} initiated with ${worker.user.name}`);
  };

  if (!worker) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[100] shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">Worker Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 mb-4 shadow-xl shadow-blue-500/20">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[22px] flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                {worker.photoUrl ? (
                  <img src={worker.photoUrl} alt={worker.user.name} className="w-full h-full object-cover" />
                ) : (
                  worker.user.name.charAt(0)
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{worker.user.name}</h3>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              <ShieldCheck size={16} />
              Verified Professional
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rating</p>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-lg">
                <Star size={18} className="fill-current" />
                {worker.rating?.toFixed(1) || "0.0"}
              </div>
              <p className="text-[10px] text-gray-400">{worker.reviewCount || 0} reviews</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Experience</p>
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-lg">
                <Briefcase size={18} />
                5+ Years
              </div>
              <p className="text-[10px] text-gray-400">Top Performer</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((s: any) => (
                  <span key={s.skillId} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold">
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Location</h4>
              <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                <MapPin size={16} className="text-red-400" />
                <span className="text-sm">Jalukbari, Guwahati, Assam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/5 bg-white/5 grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleAction('call')}
            className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <Phone size={18} />
            Call
          </button>
          <button 
            onClick={() => handleAction('message')}
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
          >
            <MessageSquare size={18} />
            Message
          </button>
          <button 
            onClick={() => router.push(`/p/${worker.userId}`)}
            className="col-span-2 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
          >
            View Full Profile
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
