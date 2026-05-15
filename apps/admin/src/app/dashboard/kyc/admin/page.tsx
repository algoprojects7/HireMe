"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { ShieldCheck, Check, X, Eye, Phone, User, Calendar, ExternalLink } from 'lucide-react';

export default function AdminKycPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/kyc/admin/pending');
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching pending requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      await api.patch(`/kyc/admin/verify/${id}`, { status, comment });
      setSelectedRequest(null);
      setComment('');
      await fetchPendingRequests();
    } catch (err) {
      console.error('Error verifying KYC', err);
      alert('Failed to update KYC status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Pending KYC Approvals</h1>
        <p className="text-gray-400">Review and verify identity documents for workers and providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-4">
          {requests.length === 0 ? (
            <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl">
              <ShieldCheck size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No pending requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <div 
                key={request.id} 
                className={`p-4 bg-white/5 border rounded-2xl transition-all cursor-pointer ${selectedRequest?.id === request.id ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10' : 'border-white/10 hover:border-white/20'}`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {request.photoUrl ? (
                        <img src={request.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{request.user.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Phone size={12} /> {request.user.phone}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{request.user.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Eye size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details & Actions Pane */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="sticky top-8 space-y-6 p-6 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4 mb-4">Request Details</h3>
              
              <div className="space-y-4">
                <div className="aspect-square w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <img src={selectedRequest.photoUrl} alt="User Profile" className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <DetailItem label="Aadhaar Number" value={selectedRequest.aadhaarNumber} />
                  <DetailItem label="PAN Number" value={selectedRequest.panNumber} />
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <label className="text-sm font-medium text-gray-300">Admin Comment (Required for Rejection)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter reason for rejection or special notes..."
                    className="w-full h-24 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button 
                    onClick={() => handleVerify(selectedRequest.id, 'REJECTED')}
                    disabled={actionLoading}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  >
                    <X size={18} className="mr-2" /> Reject
                  </Button>
                  <Button 
                    onClick={() => handleVerify(selectedRequest.id, 'APPROVED')}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Check size={18} className="mr-2" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-8 p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <Eye size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">Select a request from the list to view details and take action</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-medium bg-white/5 px-3 py-2 rounded-lg border border-white/5 flex justify-between items-center">
        {value}
        <ExternalLink size={14} className="text-gray-600" />
      </p>
    </div>
  );
}
