"use client";

import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { Button } from '@repo/ui';
import api from '@/lib/api';

interface ReviewModalProps {
  bookingId: string;
  role: 'PROVIDER_TO_WORKER' | 'WORKER_TO_PROVIDER';
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ bookingId, role, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/reviews', {
        bookingId,
        rating,
        comment,
        role,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Rate your experience</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest font-bold">Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => !rating && setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={40} 
                    className={`${
                      star <= rating 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-gray-700'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Your Feedback
              </label>
              <div className="relative">
                <MessageSquare className="absolute top-4 left-4 text-gray-600" size={18} />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what went well or what could be better..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors h-32 resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-xl">
                {error}
              </p>
            )}

            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Send size={18} className="mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
