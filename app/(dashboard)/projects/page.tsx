'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Calendar } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import Avatar from '../../../components/Avatar';

export default function ProjectsOverviewPage() {
  const { projects, loading, searchQuery, setSearchQuery } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter & Search Logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'On Track': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'At Risk': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Completed': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getProgressColor = (status: string) => {
    if (status === 'At Risk') return 'bg-rose-500';
    if (status === 'Completed') return 'bg-slate-500';
    if (status === 'On Track') return 'bg-emerald-500';
    return 'bg-blue-600';
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header and actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Overview</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage and track your active initiatives.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 w-56 placeholder:text-slate-400 transition-all shadow-sm"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-none cursor-pointer transition-all shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-sm">
          <span className="text-sm text-slate-400 font-medium">No projects match the criteria.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>

                </div>

                {/* Name */}
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-all line-clamp-1">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 min-h-[3rem]">
                  {project.description}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 border-t border-slate-50 pt-4 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.startDate} - {project.endDate}</span>
                  </div>
                  <span>{project.progress || 0}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(project.status)}`}
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
