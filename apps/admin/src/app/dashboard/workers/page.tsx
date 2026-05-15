"use client";

import React, { useState, useEffect } from 'react';
import { Button, MapView } from '@repo/ui';
import api from '@/lib/api';
import { Search, Filter, Plus, MoreVertical, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/workers');
        setWorkers(response.data);
      } catch (err) {
        console.error('Failed to fetch workers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Worker Management</h1>
          <p className="text-gray-400 text-sm">Manage and verify platform workers.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500">
          <Plus size={18} className="mr-2" />
          Add New Worker
        </Button>
      </div>

      {/* Live Map Tracking */}
      <div className="mb-8">
        <MapView workers={workers} />
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search workers by name or skill..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-gray-400">
          <Filter size={18} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Workers Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Worker</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Skills</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Verification</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8 h-16 bg-white/5" />
                </tr>
              ))
            ) : workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No workers found.
                </td>
              </tr>
            ) : (
              workers.map((worker: any) => (
                <tr key={worker.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full" />
                      <div>
                        <p className="text-white font-medium">{worker.user.name}</p>
                        <p className="text-xs text-gray-500">{worker.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.map((s: any) => (
                        <span key={s.skillId} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full border border-blue-500/20">
                          {s.skill.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${worker.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {worker.isAvailable ? 'Available' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {worker.isVerified ? (
                      <div className="flex items-center text-emerald-400 text-xs">
                        <ShieldCheck size={14} className="mr-1" />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400 text-xs">
                        <ShieldAlert size={14} className="mr-1" />
                        Pending
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
