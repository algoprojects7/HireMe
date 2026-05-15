"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { ShieldCheck, Clock, CheckCircle, AlertCircle, Upload, FileText, User, CreditCard } from 'lucide-react';

export default function KycPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    photoUrl: ''
  });

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const response = await api.get('/kyc/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error fetching KYC status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/kyc/submit', formData);
      await fetchKycStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit KYC request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If Admin, show a link to the Admin KYC Management or show a message
  if (user?.role === 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center">
          <ShieldCheck size={48} className="mx-auto text-blue-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">KYC Management</h1>
          <p className="text-gray-400 mb-6">As an admin, you can review and approve worker KYC requests.</p>
          <Button 
            onClick={() => window.location.href = '/dashboard/kyc/admin'}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Go to Admin KYC Panel
          </Button>
        </div>
      </div>
    );
  }

  const kycStatus = status?.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Identity Verification (KYC)</h1>
        <p className="text-gray-400">Complete your KYC to get verified and start receiving bookings.</p>
      </div>

      {kycStatus === 'APPROVED' && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">KYC Verified</h3>
            <p className="text-emerald-400/80">Your identity has been verified. You now have full access to the platform.</p>
          </div>
        </div>
      )}

      {kycStatus === 'PENDING' && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Verification in Progress</h3>
            <p className="text-amber-400/80">Our team is reviewing your documents. This usually takes 24-48 hours.</p>
          </div>
        </div>
      )}

      {kycStatus === 'REJECTED' && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Verification Rejected</h3>
            <p className="text-red-400/80 mb-2">Your KYC was not approved. Reason: {status?.kycRequest?.adminComment || 'Please check your details.'}</p>
            <p className="text-gray-400 text-sm">Please update your information and resubmit.</p>
          </div>
        </div>
      )}

      {(kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED') && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <CreditCard size={16} /> Aadhaar Number
              </label>
              <input
                type="text"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                placeholder="12-digit Aadhaar Number"
                maxLength={12}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileText size={16} /> PAN Number
              </label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                placeholder="10-character PAN Number"
                maxLength={10}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User size={16} /> Profile Photo URL
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="Link to your profile photo"
                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={20} className="text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Submit for Verification'}
          </Button>
        </form>
      )}

      {kycStatus === 'APPROVED' && status?.kycRequest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard icon={<CreditCard />} label="Aadhaar Number" value={status.kycRequest.aadhaarNumber} />
          <DetailCard icon={<FileText />} label="PAN Number" value={status.kycRequest.panNumber} />
        </div>
      )}
    </div>
  );
}

function DetailCard({ icon, label, value }: any) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-lg text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-white font-medium">{value}</p>
      </div>
    </div>
  );
}
