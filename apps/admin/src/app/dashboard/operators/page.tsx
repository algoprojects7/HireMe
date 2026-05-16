"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Activity,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@repo/ui';
import api from '@/lib/api';

export default function OperatorsManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [operators, setOperators] = useState<any[]>([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await api.get('/users?role=OPERATOR');
        setOperators(response.data);
      } catch (err) {
        console.error('Failed to fetch operators', err);
      } finally {
        setFetching(false);
      }
    };
    fetchOperators();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/users/operators', form);
      setOperators([...operators, { 
        ...response.data,
      }]);
      setShowModal(false);
      setForm({ name: '', phone: '', password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create operator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Operator Management</h1>
          <p className="text-gray-400 text-sm">Create and manage staff accounts for daily operations.</p>
        </div>
        <Button 
          onClick={() => {
            setError('');
            setShowModal(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-900/20"
        >
          <UserPlus size={18} className="mr-2" />
          Add New Operator
        </Button>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : operators.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-gray-500">No operators found. Create your first operator to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operators.map((op: any) => (
            <div key={op.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-amber-500/10">
                  <span className="text-amber-400 font-bold text-lg">{op.name.charAt(0)}</span>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{op.name}</h3>
              <p className="text-sm text-gray-500 mb-6">+91 {op.phone}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className="text-emerald-400 font-bold">{op.isActive !== false ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex gap-2">
                <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all">
                  Edit Access
                </button>
                <button className="px-3 py-2 bg-red-500/5 hover:bg-red-500/10 rounded-lg text-red-400 transition-all">
                  <Activity size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2">Create Operator</h2>
            <p className="text-gray-400 text-sm mb-8">Setup a new staff account with limited permissions.</p>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Initial Password</label>
                <input 
                  type="password" 
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  placeholder="Min 6 characters"
                />
              </div>
              
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-amber-900/20"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
