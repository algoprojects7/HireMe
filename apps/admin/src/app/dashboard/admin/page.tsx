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
  UserPlus,
  Star,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@repo/ui';
import Link from 'next/link';

export default function AdminDashboard() {
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/analytics/summary');
        setSummary(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          value={`₹${(summary?.revenue?.totalPlatformFee ?? 0).toLocaleString()}`} 
          change="+0%" 
          icon={<TrendingUp className="text-emerald-400" />} 
        />
        <StatCard 
          title="Active Workers" 
          value={summary?.workers?.total ?? 0} 
          change="+0%" 
          icon={<Users className="text-blue-400" />} 
        />
        <StatCard 
          title="Pending KYCs" 
          value={summary?.platform?.kycPending ?? 0} 
          change="0" 
          icon={<ShieldCheck className="text-amber-400" />} 
        />
        <StatCard 
          title="Open Disputes" 
          value="0" 
          change="0" 
          icon={<AlertCircle className="text-red-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Management</h3>
            <div className="grid grid-cols-1 gap-3">
              <QuickLink href="/dashboard/kyc" icon={ShieldCheck} label="Approve Pending KYCs" count={summary?.platform?.kycPending > 0 ? summary.platform.kycPending : null} color="text-amber-400" />
              <QuickLink href="/dashboard/qr-codes" icon={QrCode} label="Generate New QR Codes" color="text-blue-400" />
               <QuickLink href="/dashboard/operators" icon={UserPlus} label="Manage Operators" color="text-purple-400" />
              <QuickLink href="/dashboard/admin/reviews" icon={Star} label="Review Moderation" color="text-amber-400" />
              <QuickLink href="/dashboard/penalties" icon={AlertTriangle} label="Handle Penalties" color="text-red-400" />
            </div>
          </div>
        </div>

        {/* Recent Activity Log - Actually fetching logs would be better, but for now we'll just show 'No recent activity' if no data */}
        <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-2xl h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <h3 className="text-lg font-semibold text-white mb-6 z-10">System Activity Log</h3>
          <div className="space-y-4 z-10">
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm italic">
               No recent system activity recorded.
            </div>
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


