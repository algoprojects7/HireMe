"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Phone,
  ArrowUpDown,
  QrCode
} from 'lucide-react';
import { Button } from '@repo/ui';
import api from '@/lib/api';
import { roleBadgeColors } from '@/lib/navigation';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Users</h1>
          <p className="text-gray-400 text-sm">Manage Providers and Workers across the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or mobile number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-400">
            <Filter size={18} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="border-white/10 text-gray-400">
            <ArrowUpDown size={18} className="mr-2" />
            Sort
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">KYC Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8 h-16 bg-white/[0.01]" />
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => {
                const badge = roleBadgeColors[user.role] || roleBadgeColors.WORKER;
                return (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-full flex items-center justify-center font-bold text-sm text-gray-300">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{user.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Phone size={10} /> +91 {user.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.gender || 'Not specified'}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center text-[10px] font-bold uppercase tracking-wider ${
                        user.kycStatus === 'APPROVED' ? 'text-emerald-400' : 
                        user.kycStatus === 'PENDING' ? 'text-amber-400' : 'text-gray-500'
                      }`}>
                        <ShieldCheck size={14} className="mr-1.5" />
                        {user.kycStatus || 'NOT_SUBMITTED'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => window.location.href = `/dashboard/qr-codes?userId=${user.id}`}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"
                          title="View QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="Manage User"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
