"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Calendar, MapPin, Clock } from 'lucide-react';
import { initiatePayment } from '@/lib/razorpay';
import { ShieldCheck, CheckCircle2, MessageCircle, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import ReviewModal from '@/components/ReviewModal';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [reviewingBooking, setReviewingBooking] = useState<any>(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleFeedback = async (bookingId: string, feedback: boolean) => {
    try {
      await api.post(`/bookings/${bookingId}/feedback`, { feedback });
      fetchBookings();
      alert('Feedback submitted. Funds will be released once both parties agree.');
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Booking Management</h1>
        <p className="text-gray-400 text-sm">Monitor and manage all service bookings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500">
            No active bookings found in the system.
          </div>
        ) : (
          bookings.map((booking: any) => {
            const isWorker = booking.worker?.userId === user?.userId;
            const isProvider = booking.customer?.userId === user?.userId;
            const canReview = booking.status === 'COMPLETED' && (isWorker || isProvider);
            const needsPayment = isProvider && booking.paymentStatus === 'UNPAID';
            const canGiveFeedback = booking.status === 'IN_PROGRESS' || booking.status === 'CONFIRMED';
            
            const myFeedback = isWorker ? booking.workerFeedback : booking.providerFeedback;
            const otherFeedback = isWorker ? booking.providerFeedback : booking.workerFeedback;

            return (
              <div key={booking.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Booking #{booking.id.slice(-6).toUpperCase()}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center text-xs text-gray-400">
                        {booking.customer?.user?.name} → {booking.worker?.user?.name}
                      </span>
                      <span className="flex items-center text-xs text-gray-400">
                        <Clock size={12} className="mr-1" />
                        {new Date(booking.startTime).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        booking.paymentStatus === 'PAID_FULL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right mr-4">
                    <p className="text-lg font-bold text-white">₹{booking.amount}</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                      booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {needsPayment && (
                      <button 
                        onClick={() => initiatePayment(booking.amount, booking.id, fetchBookings)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <CreditCard size={14} />
                        Pay Now
                      </button>
                    )}

                    {canGiveFeedback && !myFeedback && (
                      <button 
                        onClick={() => handleFeedback(booking.id, true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} />
                        No Issues
                      </button>
                    )}

                    {myFeedback && !otherFeedback && (
                      <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Waiting for Other Party
                      </div>
                    )}

                    {canReview && (
                      <button 
                        onClick={() => setReviewingBooking(booking)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Rate Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {reviewingBooking && (
        <ReviewModal
          bookingId={reviewingBooking.id}
          role={reviewingBooking.worker?.userId === user?.userId ? 'WORKER_TO_PROVIDER' : 'PROVIDER_TO_WORKER'}
          onClose={() => setReviewingBooking(null)}
          onSuccess={() => {
            fetchBookings();
            alert('Thank you for your feedback!');
          }}
        />
      )}
    </div>
  );
}

// Minimal Users icon mock for internal use
function Users({ size, className }: { size: number, className?: string }) {
  return <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
