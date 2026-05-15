"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { User, Phone, Mail, ShieldCheck, Camera, Save, AlertCircle, Info } from 'lucide-react';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    gender: user?.gender || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.patch('/users/me', formData);
      // Update local store
      if (user && response.data) {
        // Assuming the store has a way to update just the user object
        // For now we'll just setAuth again with the same token
        const token = useAuthStore.getState().token;
        setAuth(response.data, token!);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl overflow-hidden">
                {user?.name?.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl border-4 border-[#0a0a0a] hover:bg-blue-500 transition-colors">
                <Camera size={18} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest">{user?.role}</p>
            
            <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-xs font-bold">
              <ShieldCheck size={14} /> KYC Verified
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
             <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
               <Info size={16} className="text-gray-500" /> Account Status
             </h4>
             <div className="space-y-3">
                <StatusRow label="Member Since" value={new Date().toLocaleDateString()} />
                <StatusRow label="Account Type" value="Personal" />
                <StatusRow label="Phone Verified" value="Yes" />
             </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="" disabled className="bg-[#0a0a0a]">Select Gender</option>
                  <option value="Male" className="bg-[#0a0a0a]">Male</option>
                  <option value="Female" className="bg-[#0a0a0a]">Female</option>
                  <option value="Other" className="bg-[#0a0a0a]">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Mobile Number (Read-only)</label>
              <div className="relative opacity-60 cursor-not-allowed">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={user?.phone || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                  <ShieldCheck size={16} /> Profile updated successfully!
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-white font-medium">{value}</span>
    </div>
  );
}
