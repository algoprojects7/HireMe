"use client";

import React from 'react';
import { 
  Users, 
  Briefcase, 
  Wallet,
  Clock,
  ShieldCheck,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@repo/ui';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

export default function ProviderDashboard() {
  const [stats, setStats] = useState<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/reviews/stats/${user.userId}?type=CUSTOMER`);
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Provider Dashboard</h1>
          <p className="text-gray-400">Manage your workforce and service bookings.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white">
          <Search size={18} className="mr-2" />
          Find Workers
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Wallet Balance" 
          value="₹8,450" 
          icon={<Wallet className="text-emerald-400" />} 
          action="Top Up"
        />
        <StatCard 
          title="Active Bookings" 
          value="4" 
          icon={<Clock className="text-blue-400" />} 
        />
        <StatCard 
          title="User Rating" 
          value={stats?.average?.toFixed(1) || "0.0"} 
          icon={<Search className="text-amber-400" />} 
        />
        <StatCard 
          title="KYC Status" 
          value="Verified" 
          icon={<ShieldCheck className="text-emerald-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Hires */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Current Workers</h3>
          <div className="space-y-4">
            <WorkerCard 
              name="Rajesh Kumar" 
              skill="Plumbing" 
              status="On Site" 
              since="8:30 AM Today"
            />
            <WorkerCard 
              name="Suresh Singh" 
              skill="Electrician" 
              status="Heading Back" 
              since="Yesterday"
            />
          </div>
          <button className="w-full mt-6 text-gray-400 text-sm hover:text-white transition-colors">View all hires →</button>
        </div>

        {/* Recent Transactions */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Wallet Activity</h3>
          <div className="space-y-4">
            <TransactionItem 
              label="Booking Payment #BK-9842" 
              amount="-₹450" 
              date="Today, 2:15 PM" 
              isDebit
            />
            <TransactionItem 
              label="Wallet Topup (UPI)" 
              amount="+₹2,000" 
              date="Yesterday, 11:30 AM" 
              isDebit={false}
            />
            <TransactionItem 
              label="Booking Refund #BK-9810" 
              amount="+₹300" 
              date="May 12, 4:45 PM" 
              isDebit={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, action }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="p-3 bg-white/5 rounded-xl w-fit mb-4">
          {icon}
        </div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      {action && (
        <button className="mt-4 text-xs font-bold text-blue-400 uppercase tracking-wider hover:underline self-start">
          {action}
        </button>
      )}
    </div>
  );
}

function WorkerCard({ name, skill, status, since }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm text-white font-medium">{name}</p>
          <p className="text-xs text-gray-500">{skill}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-emerald-400 uppercase">{status}</p>
        <p className="text-[10px] text-gray-500">{since}</p>
      </div>
    </div>
  );
}

function TransactionItem({ label, amount, date, isDebit }: any) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        <p className="text-[10px] text-gray-500">{date}</p>
      </div>
      <p className={`text-sm font-bold ${isDebit ? 'text-red-400' : 'text-emerald-400'}`}>
        {amount}
      </p>
    </div>
  );
}
