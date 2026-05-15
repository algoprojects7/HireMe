"use client";

import React from 'react';
import { 
  Users, 
  Briefcase, 
  FileEdit,
  Search,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Button } from '@repo/ui';

export default function OperatorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Operation Desk</h1>
        <p className="text-gray-400">Data entry and worker management portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Workers Registered Today" 
          value="24" 
          icon={<Users className="text-blue-400" />} 
        />
        <StatCard 
          title="Bookings Processed" 
          value="45" 
          icon={<Briefcase className="text-purple-400" />} 
        />
        <StatCard 
          title="KYCs Verified" 
          value="18" 
          icon={<CheckCircle className="text-emerald-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Task Queue */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Pending Tasks</h3>
            <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-full font-bold">12 ACTION ITEMS</span>
          </div>
          
          <div className="space-y-3">
            <TaskItem 
              label="Verify KYC for Amit Kumar" 
              type="KYC" 
              time="10 mins ago" 
              priority="High"
            />
            <TaskItem 
              label="New Worker Registration: Sunita R." 
              type="ENTRY" 
              time="25 mins ago" 
              priority="Medium"
            />
            <TaskItem 
              label="Update Booking Status #BK-9831" 
              type="BOOKING" 
              time="1 hour ago" 
              priority="Low"
            />
          </div>
          
          <Button className="w-full mt-6 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300">
            View Task Queue
          </Button>
        </div>

        {/* Quick Data Entry */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Quick Data Entry</h3>
          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-left">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                <Plus size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">New Worker Registration</p>
                <p className="text-xs text-gray-400">Add a new worker profile to the system</p>
              </div>
            </button>
            
            <button className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all text-left">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                <FileEdit size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">Log Manual Booking</p>
                <p className="text-xs text-gray-400">Create a booking on behalf of a provider</p>
              </div>
            </button>
            
            <button className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all text-left">
              <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Search size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">Update Worker Info</p>
                <p className="text-xs text-gray-400">Search and edit existing worker details</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
      <div className="p-3 bg-white/5 rounded-xl w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function TaskItem({ label, type, time, priority }: any) {
  const priorityColor = priority === 'High' ? 'text-red-400' : priority === 'Medium' ? 'text-amber-400' : 'text-blue-400';
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded text-gray-400 uppercase tracking-tighter">
          {type}
        </div>
        <div>
          <p className="text-sm text-white font-medium">{label}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
      <div className={`text-[10px] font-bold uppercase ${priorityColor}`}>
        {priority}
      </div>
    </div>
  );
}
