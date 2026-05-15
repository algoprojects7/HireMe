"use client";

import React from 'react';
import { Settings, Save, Shield, Database, Bell, Lock } from 'lucide-react';
import { Button } from '@repo/ui';

export default function SystemConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">System Configuration</h1>
          <p className="text-gray-400 text-sm">Manage platform settings, API keys, and security policies.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6">
          <Save size={18} className="mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ConfigSection 
            title="General Settings" 
            icon={<Settings className="text-blue-400" />}
            fields={[
              { label: "Platform Name", value: "HireMe - Unorganized Workers Platform" },
              { label: "Support Email", value: "support@hireme.com" },
              { label: "Commission Percentage (%)", value: "10" }
            ]}
          />
          
          <ConfigSection 
            title="AI & Algorithm" 
            icon={<Shield className="text-purple-400" />}
            fields={[
              { label: "Recommendation Radius (km)", value: "15" },
              { label: "Minimum Rating for Priority", value: "4.2" },
              { label: "AI Model Provider", value: "Gemini-1.5-Flash (Primary)" }
            ]}
          />
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Security Overview</h3>
            <div className="space-y-4">
              <SecurityItem icon={Lock} label="2FA for Admins" active={true} />
              <SecurityItem icon={Bell} label="Login Notifications" active={true} />
              <SecurityItem icon={Database} label="Auto DB Backups" active={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSection({ title, icon, fields }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {fields.map((f: any, i: number) => (
          <div key={i}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{f.label}</label>
            <input 
              type="text" 
              defaultValue={f.value}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityItem({ icon: Icon, label, active }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm text-gray-300">
        <Icon size={16} />
        {label}
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-700'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}
