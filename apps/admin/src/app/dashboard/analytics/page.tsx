"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  TrendingUp, Users, Briefcase, DollarSign, BarChart2,
  Award, Star, Activity, CheckCircle, Clock, XCircle, AlertCircle,
  ArrowUpRight, Zap, MapPin
} from 'lucide-react';

// ─── Tiny SVG Bar Chart ─────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-gray-600 text-sm">No data yet</div>;
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-blue-500/30 hover:bg-blue-500/60 rounded-sm transition-all duration-300 cursor-pointer"
            style={{ height: `${(d.revenue / max) * 100}%`, minHeight: 2 }}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10">
            ₹{d.revenue.toFixed(0)} — {d.date}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (SVG) ───────────────────────────────────────────────────────
function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const colors: Record<string, string> = {
    COMPLETED: '#10b981', PENDING: '#f59e0b', CONFIRMED: '#3b82f6', CANCELLED: '#ef4444',
  };
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let cumulative = 0;
  const r = 40, cx = 50, cy = 50, strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {data.map((d, i) => {
          const pct = d.count / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const offset = cumulative * circumference;
          cumulative += pct;
          return (
            <circle key={i}
              r={r} cx={cx} cy={cy} fill="none"
              stroke={colors[d.status] ?? '#6b7280'}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
          );
        })}
        <text x="50" y="55" textAnchor="middle" className="fill-white" fontSize="14" fontWeight="bold">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[d.status] ?? '#6b7280' }} />
            <span className="text-gray-400">{d.status}</span>
            <span className="ml-auto font-bold text-white pl-4">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowUpRight size={14} className="text-gray-600" />
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [topSkills, setTopSkills] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => { fetchAll(); }, [timeRange]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, t, tw, ts, bs] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/analytics/revenue-timeline?days=${timeRange}`),
        api.get('/analytics/top-workers?limit=8'),
        api.get('/analytics/top-skills'),
        api.get('/analytics/booking-status'),
      ]);
      setSummary(s.data);
      setTimeline(t.data);
      setTopWorkers(tw.data);
      setTopSkills(ts.data);
      setBookingStatus(bs.data);
    } catch (err) {
      console.error('Analytics fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const maxSkill = Math.max(...topSkills.map(s => s.workerCount), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm">Real-time platform intelligence for HireMe administrators.</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setTimeRange(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === d ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Total Platform Revenue" color="bg-blue-600"
          value={`₹${(summary?.revenue?.totalPlatformFee ?? 0).toLocaleString()}`}
          sub="From completed bookings" />
        <KpiCard icon={Users} label="Registered Workers" color="bg-purple-600"
          value={summary?.workers?.total ?? 0}
          sub={`${summary?.platform?.kycPending ?? 0} KYC Pending`} />
        <KpiCard icon={Briefcase} label="Total Bookings" color="bg-emerald-600"
          value={summary?.bookings?.total ?? 0}
          sub={`${summary?.bookings?.completionRate ?? 0}% completion rate`} />
        <KpiCard icon={Activity} label="Registered Providers" color="bg-amber-600"
          value={summary?.providers?.total ?? 0}
          sub={`${summary?.platform?.openTickets ?? 0} open support tickets`} />
      </div>

      {/* Revenue Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 rounded-3xl">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Provider Fees Collected</p>
          <p className="text-2xl font-black text-white">₹{((summary?.revenue?.totalPlatformFee ?? 0) / 2).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">5% surcharge on provider bookings</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border border-emerald-500/20 rounded-3xl">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Worker Service Fees</p>
          <p className="text-2xl font-black text-white">₹{((summary?.revenue?.totalPlatformFee ?? 0) / 2).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">5% deduction from worker earnings</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/10 border border-purple-500/20 rounded-3xl">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">Withdrawal Gateway Fees</p>
          <p className="text-2xl font-black text-white">₹{(summary?.revenue?.gatewayFees ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">2.5% per payout processed</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Timeline */}
        <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" /> Revenue Timeline (Last {timeRange} Days)
            </h3>
            <span className="text-[10px] text-gray-600 font-mono">Platform Fee (₹)</span>
          </div>
          <MiniBarChart data={timeline} />
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>{timeline[0]?.date ?? '—'}</span>
            <span>{timeline[timeline.length - 1]?.date ?? '—'}</span>
          </div>
        </div>

        {/* Booking Status Donut */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <BarChart2 size={18} className="text-purple-400" /> Booking Status
          </h3>
          <DonutChart data={bookingStatus} />
          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-emerald-400 text-xl font-black">{summary?.bookings?.completed ?? 0}</p>
              <p className="text-[10px] text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-amber-400 text-xl font-black">{summary?.bookings?.pending ?? 0}</p>
              <p className="text-[10px] text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Workers */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Award size={18} className="text-amber-400" /> Top Performing Workers
          </h3>
          <div className="space-y-3">
            {topWorkers.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">No completed bookings yet</p>
            ) : topWorkers.map((w, i) => (
              <div key={w.workerId} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                  i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-white/10'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-bold truncate">{w.name}</p>
                    {w.isGroupLeader && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded text-[9px] font-bold">LEADER</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">{w.topSkill}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 text-sm font-bold">₹{w.totalEarned.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600">{w.completedJobs} jobs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills in Demand */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Zap size={18} className="text-blue-400" /> Skills in Demand
          </h3>
          <div className="space-y-3">
            {topSkills.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">No skills registered yet</p>
            ) : topSkills.map((s, i) => (
              <div key={s.skillId} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-gray-500">{s.workerCount} workers</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(s.workerCount / maxSkill) * 100}%`,
                      background: `hsl(${210 + i * 20}, 70%, 60%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Platform health indicators */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Platform Health</h4>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle size={14} /> KYC Pending Reviews
              </div>
              <span className="font-bold text-white">{summary?.platform?.kycPending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle size={14} /> Open Support Tickets
              </div>
              <span className="font-bold text-white">{summary?.platform?.openTickets ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-400">
                <MapPin size={14} /> Skill Categories
              </div>
              <span className="font-bold text-white">{summary?.platform?.skills ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
