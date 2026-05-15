"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { ShieldCheck, Star, MapPin, Briefcase, Calendar, Award, CheckCircle2 } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // We'll use a public endpoint for this
        const response = await api.get(`/users/public/${params.id}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={40} className="text-red-400 opacity-20" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
        <p className="text-gray-400 max-w-xs">The profile you are looking for does not exist or has not been verified yet.</p>
        <a href="/" className="mt-8 text-blue-400 hover:underline">Back to Home</a>
      </div>
    );
  }

  const isVerified = profile.kycStatus === 'APPROVED';

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      {/* Header / Cover */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-24 pb-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             {isVerified ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={14} /> Verified
                </div>
             ) : (
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                  Pending Verification
                </div>
             )}
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-3xl bg-[#111] border-4 border-[#0a0a0a] shadow-xl overflow-hidden mb-6 -mt-16">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-4xl font-bold text-gray-500">
                  {profile.name?.charAt(0)}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-extrabold mb-1">{profile.name}</h1>
            <p className="text-blue-400 font-medium mb-6 uppercase tracking-widest text-xs">{profile.role}</p>

            <div className="flex items-center gap-6 mb-8">
              <StatItem label="Rating" value="4.9" icon={<Star size={14} className="text-amber-400 fill-amber-400" />} />
              <div className="w-px h-8 bg-white/10" />
              <StatItem label="Experience" value="3+ Years" icon={<Briefcase size={14} className="text-blue-400" />} />
              <div className="w-px h-8 bg-white/10" />
              <StatItem label="Jobs" value="142" icon={<CheckCircle2 size={14} className="text-emerald-400" />} />
            </div>

            <div className="w-full space-y-4 text-left">
               <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">About</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Professional {profile.role} with expertise in high-quality service delivery. 
                    Committed to punctuality and customer satisfaction.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={<MapPin size={16} />} label="Location" value="New Delhi, India" />
                  <InfoRow icon={<Calendar size={16} />} label="Joined" value={new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
               </div>
            </div>

            <button className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              Book This {profile.role}
            </button>
          </div>
        </div>

        {/* Verification Details */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
           <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
             <ShieldCheck size={18} className="text-blue-400" /> Trust & Safety
           </h4>
           <div className="space-y-3">
              <VerificationItem label="Identity Verified" status={isVerified} />
              <VerificationItem label="Mobile Verified" status={true} />
              <VerificationItem label="Background Check" status={isVerified} />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5 text-white font-bold text-lg mb-0.5">
        {icon} {value}
      </div>
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
      <div className="text-blue-400">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function VerificationItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      {status ? (
        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
          <Award size={14} /> Completed
        </span>
      ) : (
        <span className="text-gray-600 text-xs font-bold">Pending</span>
      )}
    </div>
  );
}
