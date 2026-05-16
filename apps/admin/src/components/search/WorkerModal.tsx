'use client';

import React from 'react';
import { X, Star, Phone, MessageSquare, ShieldCheck, MapPin, Briefcase, Zap, ArrowRight, Clock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface WorkerModalProps {
  worker: any;
  onClose: () => void;
}

export default function WorkerModal({ worker, onClose }: WorkerModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!worker) return null;

  const handleAction = (action: 'call' | 'message') => {
    if (!user) {
      router.push('/auth/login?redirect=/search');
      return;
    }
    alert(`${action.toUpperCase()} initiated with ${worker.user.name}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-zinc-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors z-10 text-zinc-500"
          >
            <X size={20} />
          </button>

          {/* Top Profile Section */}
          <div className="p-8 bg-gradient-to-br from-zinc-50 to-white border-b border-zinc-100">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-[35%] bg-blue-600 p-1 rotate-3 shadow-xl shadow-blue-500/20">
                  <div className="w-full h-full bg-white rounded-[32%] flex items-center justify-center -rotate-3 overflow-hidden">
                    {worker.photoUrl ? (
                      <img src={worker.photoUrl} alt={worker.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-blue-600">{worker.user.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white shadow-lg">
                  <ShieldCheck size={16} />
                </div>
              </div>

              <h3 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">{worker.user.name}</h3>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                Verified Expert Professional
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-50/80 p-4 rounded-3xl border border-zinc-100 text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Rating</p>
                <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-black text-xl">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  {worker.rating?.toFixed(1) || "4.8"}
                </div>
              </div>
              <div className="bg-zinc-50/80 p-4 rounded-3xl border border-zinc-100 text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Experience</p>
                <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-black text-xl">
                  <Briefcase size={18} className="text-blue-500" />
                  5y+
                </div>
              </div>
              <div className="bg-zinc-50/80 p-4 rounded-3xl border border-zinc-100 text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Response</p>
                <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-black text-xl">
                  <Clock size={18} className="text-emerald-500" />
                  98%
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Top Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {worker.skills?.map((s: any) => (
                  <span key={s.skillId} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs font-black border border-blue-100/50 flex items-center gap-2">
                    <Award size={14} />
                    {s.skill.name}
                  </span>
                ))}
                {!worker.skills?.length && (
                  <span className="px-4 py-2 bg-zinc-50 text-zinc-500 rounded-2xl text-xs font-bold border border-zinc-100">
                    General Labor
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAction('call')}
                className="flex items-center justify-center gap-3 py-5 bg-zinc-900 text-white font-black rounded-3xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95"
              >
                <Phone size={20} />
                Call Now
              </button>
              <button
                onClick={() => handleAction('message')}
                className="flex items-center justify-center gap-3 py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <MessageSquare size={20} />
                Message
              </button>
            </div>

            <button
              onClick={() => router.push(`/p/${worker.userId}`)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-white border-2 border-zinc-100 text-zinc-600 font-black rounded-3xl hover:bg-zinc-50 transition-all group"
            >
              View Professional Portfolio
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
