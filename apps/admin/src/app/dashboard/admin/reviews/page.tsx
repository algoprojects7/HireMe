"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Star, ShieldAlert, CheckCircle, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui';

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/admin');
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleFlag = async (reviewId: string, currentFlag: boolean) => {
    try {
      await api.patch(`/reviews/${reviewId}/flag`, { 
        adminNote: currentFlag ? "Unflagged by admin" : "Flagged for moderation" 
      });
      fetchReviews(); // Refresh
    } catch (err) {
      console.error('Failed to toggle flag', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
          <p className="text-gray-400 text-sm">Monitor and moderate platform feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500">
            No reviews found in the system.
          </div>
        ) : (
          reviews.map((review: any) => (
            <div 
              key={review.id} 
              className={`p-6 bg-white/5 border rounded-2xl transition-all ${
                review.isFlagged ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      {review.role.replace(/_/g, ' ')}
                    </span>
                    {review.isFlagged && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full uppercase">
                        <ShieldAlert size={12} /> Flagged
                      </span>
                    )}
                  </div>

                  <p className="text-white text-lg mb-4 italic">"{review.comment}"</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-gray-500">From:</span>
                      <span className="text-gray-200 font-medium">
                        {review.role === 'PROVIDER_TO_WORKER' ? review.customer.user.name : review.worker.user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-gray-500">To:</span>
                      <span className="text-gray-200 font-medium">
                        {review.role === 'PROVIDER_TO_WORKER' ? review.worker.user.name : review.customer.user.name}
                      </span>
                    </div>
                  </div>
                  
                  {review.adminNote && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                      <AlertCircle size={18} className="text-amber-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Admin Note</p>
                        <p className="text-xs text-gray-300">{review.adminNote}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 justify-end">
                  <Button 
                    onClick={() => handleToggleFlag(review.id, review.isFlagged)}
                    className={`flex-1 md:flex-none ${
                      review.isFlagged ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                    } text-white text-xs font-bold py-2`}
                  >
                    {review.isFlagged ? <CheckCircle size={16} className="mr-2" /> : <ShieldAlert size={16} className="mr-2" />}
                    {review.isFlagged ? 'Resolve' : 'Flag'}
                  </Button>
                  <Button className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-bold py-2">
                    <MessageSquare size={16} className="mr-2" /> Note
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
