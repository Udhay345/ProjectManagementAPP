'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Avatar from '../../components/Avatar';
import { X, Calendar } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { usePathname } from 'next/navigation';
import { Project } from '../../types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { addProject, currentUser, searchQuery, setSearchQuery } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brief, setBrief] = useState('');
  const [status, setStatus] = useState<Project['status']>('Not Started');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      name,
      description,
      brief,
      status,
      startDate: startDate || 'Oct 12, 2023',
      endDate: endDate || 'Jan 15, 2024'
    });

    // Reset
    setName('');
    setDescription('');
    setBrief('');
    setStatus('Not Started');
    setStartDate('');
    setEndDate('');
    setModalOpen(false);

    // Refresh page by replacing window url if we are in projects page
    if (window.location.pathname === '/projects') {
      window.location.reload();
    }
  };

  const getBreadcrumbs = () => {
    const crumbs: { label: string; href?: string }[] = [{ label: 'Workspace' }];
    if (pathname === '/dashboard') {
      crumbs.push({ label: 'Dashboard' });
    } else if (pathname === '/projects') {
      crumbs.push({ label: 'Projects Overview' });
    } else if (pathname?.startsWith('/projects/')) {
      crumbs.push({ label: 'Projects', href: '/projects' });
      crumbs.push({ label: 'Project Detail' });
    } else if (pathname?.startsWith('/tasks/')) {
      crumbs.push({ label: 'Tasks' });
      crumbs.push({ label: 'Task Detail' });
    } else if (pathname === '/team') {
      crumbs.push({ label: 'Team Members' });
    } else if (pathname === '/profile') {
      crumbs.push({ label: 'Profile' });
    } else {
      crumbs.push({ label: 'Page' });
    }
    return crumbs;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-200">
      {/* Sidebar - Fixed width */}
      <Sidebar onCreateProjectClick={() => setModalOpen(true)} />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar 
          breadcrumbs={getBreadcrumbs()}
          searchPlaceholder="Search projects, tasks, team..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          userName={currentUser?.name || 'User'}
        />
        
        <main className="flex-1 bg-[#F8FAFC] dark:bg-[#0B1120] p-8 overflow-y-auto transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 dark:border-[#334155] overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]">
              <h3 className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-base">Create New Project</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Complete overhaul of the corporate marketing website..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Project Brief (Markdown supported)</label>
                <textarea
                  placeholder="Write a brief overview of goals, scope, and target metrics..."
                  value={brief}
                  rows={3}
                  onChange={(e) => setBrief(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Start & End Dates</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Oct 12, 2023"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-1/2 px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="text"
                      placeholder="Jan 15, 2024"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-1/2 px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>



              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
