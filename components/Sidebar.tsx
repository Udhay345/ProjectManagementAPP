'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  HelpCircle, 
  User,
  Plus,
  LogOut
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface SidebarProps {
  onCreateProjectClick?: () => void;
}

export default function Sidebar({ onCreateProjectClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderOpen, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  const bottomItems = [
    { name: 'Help', icon: HelpCircle, path: '/help' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#F8FAFC] dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-colors duration-200">
      {/* Brand Workspace Selector */}
      <div className="p-6 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center gap-3">
        <div className="h-10 w-10 bg-white dark:bg-[#1E293B] rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-slate-200 dark:border-[#334155]">
          <Image src={logoImg} alt="ProFlow" width={40} height={40} className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">ProFlow</span>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Workspace</span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-4">
        <button 
          onClick={onCreateProjectClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1E293B] dark:bg-blue-600 hover:bg-[#0F172A] dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5' 
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-[#64748B] dark:text-[#94A3B8]'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5' 
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-[#64748B] dark:text-[#94A3B8]'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-[#64748B] dark:text-[#94A3B8] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

