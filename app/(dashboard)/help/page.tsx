'use client';

import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Help & Documentation</h1>
          <p className="text-[#64748B] mt-1 text-sm">Learn more about ProFlow and how to use it.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">About ProFlow</h2>
            <p className="text-slate-600 leading-relaxed">
              ProFlow is a comprehensive personal project management system designed to streamline your workflow and enhance your productivity. Built with modern web technologies, ProFlow offers an intuitive interface to organize your tasks, track your project progress, and manage your personal workload effectively.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6">
          <h3 className="font-semibold text-slate-900 mb-4 text-lg">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-1">Project Tracking</h4>
              <p className="text-sm text-slate-600">Create projects, set timelines, and monitor progress across all your initiatives in real-time.</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-1">Task Management</h4>
              <p className="text-sm text-slate-600">Break down projects into actionable tasks, set priorities, and track completion status.</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-1">Interactive Dashboard</h4>
              <p className="text-sm text-slate-600">Get a bird's eye view of your work with our intuitive dashboard and real-time statistics.</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-1">Seamless Organization</h4>
              <p className="text-sm text-slate-600">Keep all your project assets, requirements, and discussions in one centralized location.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Need Support?</h2>
            <p className="text-slate-600 mb-4 text-sm">
              If you encounter any issues or have questions about using ProFlow, our support team is always here to help.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Contact Support <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
