"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
        <p className="text-gray-400">Update your account password to keep your wallet and profile secure.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPass ? "text" : "password"}
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 my-2" />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPass ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPass ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
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
                <ShieldCheck size={16} /> Password changed successfully!
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Update Security Credentials'}
            </Button>
          </div>
        </form>
      </div>

      <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
         <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
           <ShieldCheck size={18} /> Security Tip
         </h4>
         <p className="text-sm text-gray-400">
           Use a combination of upper and lower case letters, numbers, and symbols for a stronger password. Never share your password with anyone.
         </p>
      </div>
    </div>
  );
}
