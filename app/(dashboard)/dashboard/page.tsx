'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FolderOpen, 
  TrendingUp, 
  ClipboardList, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import Avatar from '../../../components/Avatar';

export default function DashboardPage() {
  const { projects, tasks, stats, loading, searchQuery } = useStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fallback values in case localstorage is empty/loading
  const currentStats = stats || {
    totalProjects: 0,
    inProgressProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  };

  const query = searchQuery.toLowerCase().trim();

  // Active Projects (exclude completed, limit to 3) — filtered by search
  const activeProjects = projects
    .filter(p => p.status !== 'Completed')
    .filter(p => !query || p.name.toLowerCase().includes(query) || (p.description || '').toLowerCase().includes(query))
    .slice(0, 3);

  // Tasks due soon (filter non-done, limit to 3) — filtered by search
  const tasksDueSoon = tasks
    .filter(t => t.status !== 'Done')
    .filter(t => !query || t.title.toLowerCase().includes(query) || (t.projectName || '').toLowerCase().includes(query))
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
      case 'On Track': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
      case 'At Risk': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
      case 'Completed': return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
      default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10';
      case 'Medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Welcome header */}
      <div className="flex flex-col text-left">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Welcome back. Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {[
          { label: 'Total Projects', value: currentStats.totalProjects, icon: FolderOpen, color: 'text-blue-600 bg-blue-50/50 border-blue-100/50' },
          { label: 'In Progress', value: currentStats.inProgressProjects, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50' },
          { label: 'Total Tasks', value: currentStats.totalTasks, icon: ClipboardList, color: 'text-amber-600 bg-amber-50/50 border-amber-100/50' },
          { label: 'Completed', value: currentStats.completedTasks, icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50/50 border-indigo-100/50' },
          { label: 'Pending', value: currentStats.pendingTasks, icon: Clock, color: 'text-slate-600 bg-slate-50/50 border-slate-100/50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-slate-400 dark:text-[#64748B]" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-4 tracking-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Two Columns: Active Projects & Tasks Due Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Projects (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9] tracking-tight">Active Projects</h2>
            <Link href="/projects" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-all">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeProjects.length === 0 && query ? (
              <div className="col-span-2 text-center py-8 text-sm text-slate-400 dark:text-[#64748B]">
                No projects match &quot;{searchQuery}&quot;
              </div>
            ) : (
              activeProjects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/projects/${project.id}`}
                  className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-[#475569] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-bold text-slate-900 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all line-clamp-1">{project.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-2 line-clamp-2 min-h-[2rem]">
                      {project.description}
                    </p>
                  </div>

                  {/* Footer with progress */}
                  <div className="mt-6 space-y-4 border-t border-slate-50 dark:border-[#334155] pt-4">
                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                        <span>Progress</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#0F172A] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            project.status === 'At Risk' ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Tasks Due Soon (Span 1) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9] tracking-tight">Tasks Due Soon</h2>
            <Link href="/tasks" className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#E2E8F0] transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-5 shadow-sm space-y-4">
            <div className="space-y-4">
              {tasksDueSoon.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-[#64748B] font-medium">
                  {query ? `No tasks match "${searchQuery}"` : 'No pending tasks due soon'}
                </div>
              ) : (
                tasksDueSoon.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block p-3.5 rounded-lg border border-slate-50 dark:border-[#334155] hover:border-slate-200 dark:hover:border-[#475569] hover:bg-slate-50/50 dark:hover:bg-[#334155]/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all line-clamp-1">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 dark:text-[#64748B]">
                          <span className="text-[#E2E8F0] dark:text-[#334155]">•</span>
                          <span>{task.projectName}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50/60 dark:border-[#334155]/60 text-[10px] font-medium text-slate-500 dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-[#64748B]" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* View all tasks button */}
            <div className="border-t border-slate-50 dark:border-[#334155] pt-4">
              <Link 
                href="/projects" 
                className="w-full flex items-center justify-center py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/30 dark:bg-blue-500/10 hover:bg-blue-50/50 dark:hover:bg-blue-500/20 rounded-lg transition-all"
              >
                View all my tasks
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
