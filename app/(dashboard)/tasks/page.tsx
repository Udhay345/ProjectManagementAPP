'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Calendar, CheckSquare } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';


export default function TasksPage() {
  const { tasks, updateTask, loading, searchQuery, setSearchQuery } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const toggleTaskStatus = (task: any) => {
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done';
    updateTask(task.id, { status: nextStatus });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 select-none text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">All Tasks</h1>
          <p className="text-sm text-[#64748B] mt-1">View, track, and complete your assigned tasks.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 w-52 placeholder:text-slate-400 transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer transition-all shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Tasks Table/List */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            No tasks found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC]/55 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4 w-40">Project</th>
                  <th className="py-3 px-4 w-32">Priority</th>
                  <th className="py-3 px-4 w-36">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={task.status === 'Done'}
                        onChange={() => toggleTaskStatus(task)}
                        className="w-4.5 h-4.5 border border-slate-300 rounded focus:ring-blue-500 text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      <Link href={`/tasks/${task.id}`} className="hover:text-blue-600 transition-all block">
                        {task.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {task.projectName}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-md ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-semibold">
                      {task.dueDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
