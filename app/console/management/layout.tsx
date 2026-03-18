'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/api';
import { AdminProfile } from '@/types';
import Link from 'next/link';

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: 'Administrator',
    email: '',
    password: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/console/authorization');
    }
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/console/authorization');
  };

  const tabs = [
    { id: '/console/management', label: 'Beranda', icon: 'fa-home' },
    { id: '/console/management/sessions', label: 'Sesi', icon: 'fa-calendar-alt' },
    { id: '/console/management/question-list', label: 'Bank Soal', icon: 'fa-book' },
    { id: '/console/management/results', label: 'Hasil', icon: 'fa-chart-bar' },
    { id: '/console/management/settings', label: 'Pengaturan', icon: 'fa-cog' },
  ];

  const isActive = (path: string) => {
    if (path === '/console/management') {
      return pathname === '/console/management';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f0f7f7] flex flex-col font-['Inter'] pb-24">
      <nav className="bg-[#016569] border-b border-[#015255] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/assets/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-black text-white tracking-tight uppercase cursor-pointer" onClick={() => router.push('/')}>
                Four-tier<span className="text-[#ffdd00]">TEST</span>
              </span>
            </div>

            <button 
              onClick={handleLogout} 
              className="text-teal-100 hover:text-[#ffdd00] flex items-center gap-2 font-bold text-xs"
            >
              <span>Keluar</span><i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)]">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col h-auto md:sticky md:top-24 max-h-[calc(100vh-120px)] z-10 pt-2">
            <div className="mb-8 px-4">
              <h1 className="text-xl font-black text-[#016569] uppercase tracking-tight leading-none mb-4">Admin Panel</h1>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-black flex-shrink-0">
                    <i className="fas fa-user-shield"></i>
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-700 truncate w-full" title={adminProfile.name}>{adminProfile.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {tabs.map(tab => {
                const active = isActive(tab.id);
                return (
                  <Link
                    key={tab.id} 
                    href={tab.id}
                    className={`px-6 py-4 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center gap-4 tracking-widest text-left ${active ? 'bg-[#016569] text-white shadow-lg shadow-teal-500/30' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-600'}`}
                  >
                    <i className={`fas ${tab.icon} w-5 text-center text-lg ${active ? 'text-white' : 'text-slate-400'}`}></i>
                    <span className="flex-1">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-h-[500px]">
            {children}
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-teal-50 py-4 fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-teal-800/40 text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} Diagnostic <i>four-tier</i> Test</p>
          <div className="flex gap-2">
            <div className="bg-[#016569]/5 px-2 py-0.5 rounded-md text-[#016569] text-[9px] font-black uppercase tracking-widest border border-teal-600/10">
              Frontend Stable
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
