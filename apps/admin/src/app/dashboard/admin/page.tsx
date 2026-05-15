"use client";

import React from 'react';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ShieldCheck,
  QrCode,
  UserPlus
} from 'lucide-react';
import { Button } from '@repo/ui';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-400">Platform-wide overview and system management.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/operators">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white">
              <UserPlus size={18} className="mr-2" />
              Create Operator
            </Button>
          </Link>
          <Link href="/dashboard/config">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Plus size={18} className="mr-2" />
              System Config
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Platform Revenue" 
          value="₹12,45,000" 
          change="+18.5%" 
          icon={<TrendingUp className="text-emerald-400" />} 
        />
        <StatCard 
          title="Active Workers" 
          value="3,420" 
          change="+12%" 
          icon={<Users className="text-blue-400" />} 
        />
        <StatCard 
          title="Pending KYCs" 
          value="128" 
          change="-4%" 
          icon={<ShieldCheck className="text-amber-400" />} 
        />
        <StatCard 
          title="Open Disputes" 
          value="14" 
          change="+2" 
          icon={<AlertCircle className="text-red-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Management</h3>
            <div className="grid grid-cols-1 gap-3">
              <QuickLink href="/dashboard/kyc" icon={ShieldCheck} label="Approve Pending KYCs" count="128" color="text-amber-400" />
              <QuickLink href="/dashboard/qr-codes" icon={QrCode} label="Generate New QR Codes" color="text-blue-400" />
               <QuickLink href="/dashboard/operators" icon={UserPlus} label="Manage Operators" count="5" color="text-purple-400" />
              <QuickLink href="/dashboard/admin/reviews" icon={Star} label="Review Moderation" color="text-amber-400" />
              <QuickLink href="/dashboard/penalties" icon={AlertTriangle} label="Handle Penalties" color="text-red-400" />
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-2xl h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <h3 className="text-lg font-semibold text-white mb-6 z-10">System Activity Log</h3>
          <div className="space-y-4 z-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Briefcase size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">New booking confirmed #BK-9842</p>
                  <p className="text-xs text-gray-500">2 minutes ago • Operator: Rahul S.</p>
                </div>
                <div className="text-xs font-bold text-emerald-400">+ ₹450</div>
              </div>
            ))}
          </div>
          <button className="mt-auto text-blue-400 text-sm font-medium hover:underline self-start z-10">View all logs →</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, count, color }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10">
      <div className="flex items-center gap-3">
        <Icon size={18} className={color} />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      {count && <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">{count}</span>}
    </Link>
  );
}

function AlertTriangle({ size, className }: any) {
  return <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}
