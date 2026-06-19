'use client';

import React, { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../../components/Avatar';
import { 
  User, 
  Mail, 
  Briefcase, 
  Save, 
  Check,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateCurrentUser, tasks, loading } = useStore();
  const { theme, setTheme } = useTheme();

  // Local Form state
  const [name, setName] = useState(currentUser?.name || 'Alex Mercer');
  const [email, setEmail] = useState(currentUser?.email || 'a.mercer@proflow.in');
  const [role, setRole] = useState(currentUser?.role || 'Engineering Lead');

  // Success indicator
  const [showToast, setShowToast] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle submit profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      role
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get all tasks count
  const myTasks = tasks;
  
  const totalAssigned = myTasks.length;
  const completedCount = myTasks.filter(t => t.status === 'Done').length;
  const inProgressCount = myTasks.filter(t => t.status === 'In Progress').length;
  const pendingCount = myTasks.filter(t => t.status === 'To Do').length;

  const themeOptions = [
    { key: 'light' as const, label: 'Light', icon: Sun },
    { key: 'dark' as const, label: 'Dark', icon: Moon },
    { key: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto pb-12">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-xs font-semibold border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4">
          <div className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">Profile Settings</h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Manage your identity, settings, and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar and stats card */}
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-6 shadow-sm text-center flex flex-col items-center transition-colors duration-200">
            <Avatar 
              memberId="usr_curr" 
              name={name} 
              size="xl" 
              className="ring-4 ring-slate-100/50 dark:ring-[#334155]/50 shadow-inner w-20 h-20 text-3xl mb-4" 
            />
            <h2 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-lg leading-tight">{name}</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold mt-1.5">{role}</p>
            <div className="mt-2 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
              Active Member
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-50 dark:border-[#334155] space-y-3.5 text-left text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-[#94A3B8]">
                <span className="font-medium">Email Address</span>
                <span className="text-slate-900 dark:text-[#E2E8F0] font-semibold truncate max-w-[160px]" title={email}>{email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-[#94A3B8]">
                <span className="font-medium">Workspace Role</span>
                <span className="text-slate-900 dark:text-[#E2E8F0] font-semibold">{role}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-[#94A3B8]">
                <span className="font-medium">Permissions</span>
                <span className="text-slate-950 dark:text-[#F1F5F9] font-bold bg-slate-50 dark:bg-[#334155] border border-slate-100 dark:border-[#475569] px-2 py-0.5 rounded text-[10px]">ADMIN</span>
              </div>
            </div>
          </div>

          {/* Workload Stats */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-6 shadow-sm space-y-4 transition-colors duration-200">
            <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm tracking-tight border-b border-slate-50 dark:border-[#334155] pb-3">Your Workload</h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-100/50 dark:border-[#334155] rounded-lg p-3">
                <span className="block text-xl font-bold text-slate-900 dark:text-[#F1F5F9]">{totalAssigned}</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8]">Total</span>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100/30 dark:border-blue-500/20 rounded-lg p-3">
                <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</span>
                <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400">In Progress</span>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100/30 dark:border-emerald-500/20 rounded-lg p-3">
                <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
                <span className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">Completed</span>
              </div>
            </div>

            {totalAssigned > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-[#94A3B8]">
                  <span>Task Completion Rate</span>
                  <span>{Math.round((completedCount / totalAssigned) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#0F172A] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.round((completedCount / totalAssigned) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Configuration Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-6 shadow-sm transition-colors duration-200">
            <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm tracking-tight border-b border-slate-50 dark:border-[#334155] pb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-[#334155] rounded-lg text-sm text-slate-900 dark:text-[#E2E8F0] bg-white dark:bg-[#0F172A] focus:outline-none focus:border-blue-500 transition-all font-medium"
                      placeholder="Alex Mercer"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-[#334155] rounded-lg text-sm text-slate-900 dark:text-[#E2E8F0] bg-white dark:bg-[#0F172A] focus:outline-none focus:border-blue-500 transition-all font-medium"
                      placeholder="a.mercer@proflow.in"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">Workspace Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-[#334155] rounded-lg text-sm text-slate-900 dark:text-[#E2E8F0] bg-white dark:bg-[#0F172A] focus:outline-none focus:border-blue-500 transition-all font-medium"
                      placeholder="Engineering Lead"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">Department</label>
                  <select 
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-[#334155] rounded-lg text-sm text-slate-900 dark:text-[#E2E8F0] bg-white dark:bg-[#0F172A] focus:outline-none focus:border-blue-500 transition-all font-medium"
                    defaultValue="ENGINEERING"
                  >
                    <option value="ENGINEERING">Engineering</option>
                    <option value="DESIGN">Design</option>
                    <option value="PRODUCT">Product</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-[#334155] flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Theme Preferences */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-6 shadow-sm transition-colors duration-200">
            <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm tracking-tight border-b border-slate-50 dark:border-[#334155] pb-4 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Appearance</span>
            </h3>

            <div className="mt-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-[#E2E8F0]">Interface Theme</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Choose how ProFlow looks on your screen.</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-lg border border-slate-200/50 dark:border-[#334155]">
                  {themeOptions.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTheme(t.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold capitalize transition-all ${
                        theme === t.key
                          ? 'bg-white dark:bg-[#334155] text-slate-900 dark:text-[#F1F5F9] shadow-sm border border-slate-200/30 dark:border-[#475569]'
                          : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
