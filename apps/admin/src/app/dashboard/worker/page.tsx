"use client";

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList,
  Wallet,
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@repo/ui';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function WorkerDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const initDashboard = async () => {
      if (!user?.worker?.id) return;
      try {
        // Fetch worker profile to get current availability status
        const workerRes = await api.get(`/workers/${user.worker.id}`);
        setIsAvailable(workerRes.data.isAvailable);

        // Fetch stats
        const statsRes = await api.get(`/reviews/stats/${user.id}?type=WORKER`);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to initialize dashboard', err);
      }
    };
    initDashboard();
  }, [user]);

  // Background tracking logic
  useEffect(() => {
    let interval: any;
    if (isAvailable && "geolocation" in navigator) {
      // Update location every 60 seconds if online
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          api.patch(`/workers/${user?.worker?.id}/location`, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }).catch(err => console.error('Background tracking failed', err));
        });
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isAvailable, user?.worker?.id]);

  const handleToggleAvailability = async () => {
    if (!user?.worker?.id) return;
    
    const updateStatus = async (lat?: number, lng?: number) => {
      try {
        const nextStatus = !isAvailable;
        await api.patch(`/workers/${user.worker.id}/availability`, { 
          isAvailable: nextStatus,
          lat: lat || 26.1311, 
          lng: lng || 91.7856
        });
        setIsAvailable(nextStatus);
      } catch (err) {
        console.error('Failed to update availability', err);
      }
    };

    if (!isAvailable) {
      // If going online, try to get real location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateStatus(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.warn("Geolocation failed, using default", error);
            updateStatus();
          }
        );
      } else {
        updateStatus();
      }
    } else {
      // Just going offline
      updateStatus();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Worker Portal</h1>
          <p className="text-gray-400">Track your jobs, earnings, and availability.</p>
        </div>
        
        {/* Availability Toggle */}
        <div className={`p-1 pl-4 flex items-center gap-4 rounded-2xl border transition-all ${isAvailable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</span>
            <span className={`text-sm font-bold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
              {isAvailable ? 'READY TO WORK' : 'OFFLINE'}
            </span>
          </div>
          <button 
            onClick={handleToggleAvailability}
            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all ${
              isAvailable 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
            }`}
          >
            {isAvailable ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
        </div>
      </div>

      {isAvailable && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Tracking Active: {navigator.geolocation ? 'Real-time GPS' : 'Fallback Mode'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Earnings" 
          value="₹14,200" 
          icon={<Wallet className="text-emerald-400" />} 
          action="Withdraw"
        />
        <StatCard 
          title="Jobs Completed" 
          value={stats?.count?.toString() || "0"} 
          icon={<CheckCircle2 className="text-blue-400" />} 
        />
        <StatCard 
          title="User Rating" 
          value={stats?.average?.toFixed(1) || "0.0"} 
          icon={<Star className="text-amber-400" />} 
        />
        <StatCard 
          title="Verification" 
          value="Level 2" 
          icon={<ShieldCheck className="text-purple-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Job */}
        <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <MapPin size={120} className="text-blue-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-6">Current Active Job</h3>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Electrical Repair</h4>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <MapPin size={14} /> 2.4 km away • Sector 62, Noida
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">₹650</p>
                <p className="text-xs text-gray-500">Fixed Rate</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl">
                START WORK
              </Button>
              <Button className="bg-white/5 border border-white/10 text-gray-300 px-6 rounded-xl hover:bg-white/10">
                DIRECTIONS
              </Button>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Upcoming Jobs</h3>
          <div className="space-y-4">
            <JobSmallCard 
              title="Painting Work" 
              date="Tomorrow" 
              time="10:00 AM" 
              pay="₹1,200"
            />
            <JobSmallCard 
              title="Kitchen Cleaning" 
              date="May 16" 
              time="02:30 PM" 
              pay="₹450"
            />
          </div>
          <Button className="w-full mt-auto bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors py-3 rounded-xl text-sm">
            Find More Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, action }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        {action && (
          <button className="text-[10px] font-bold text-blue-400 uppercase tracking-wider hover:underline">
            {action}
          </button>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function JobSmallCard({ title, date, time, pay }: any) {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
      <div className="flex justify-between mb-2">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm font-bold text-emerald-400">{pay}</p>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
        <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
        <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {time}</span>
      </div>
    </div>
  );
}
