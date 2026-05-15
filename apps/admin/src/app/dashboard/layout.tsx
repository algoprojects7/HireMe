"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getNavItemsForRole, roleBadgeColors } from '@/lib/navigation';
import { LogOut, Bell, Search, ChevronRight } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle Hydration
  useEffect(() => {
    // We wait for the component to mount, which happens after Zustand hydration
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/login');
    }
  }, [user, router, isLoaded]);

  // Don't render anything until we've checked the session
  if (!isLoaded || !user) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = getNavItemsForRole(user.role as any);
  const badge = roleBadgeColors[user.role] || roleBadgeColors.WORKER;

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            HireMe
          </h2>
          <div className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
            {user.role}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-blue-400/60" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => { logout(); router.push('/auth/login'); }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200 text-sm"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-96">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-gray-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-[#0a0a0a]" />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${badge.text}`}>{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
