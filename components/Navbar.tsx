'use client';

import React from 'react';
import { Search, Share2 } from 'lucide-react';
import Avatar from './Avatar';

interface NavbarProps {
  breadcrumbs?: { label: string; href?: string }[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  showShare?: boolean;
  onShareClick?: () => void;
  userAvatar?: string;
  userName?: string;
}

export default function Navbar({
  breadcrumbs = [{ label: 'Workspace' }, { label: 'Project Alpha' }],
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showShare = false,
  onShareClick,
  userAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  userName = 'User'
}: NavbarProps) {
  return (
    <header className="h-16 border-b border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex items-center justify-between px-8 sticky top-0 z-20 select-none transition-colors duration-200">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-[#94A3B8] dark:text-[#475569]">/</span>}
            <span 
              className={`font-medium ${
                idx === breadcrumbs.length - 1 
                  ? 'text-[#0F172A] dark:text-[#F1F5F9]' 
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-sm placeholder-[#94A3B8] dark:placeholder-[#64748B] text-[#0F172A] dark:text-[#E2E8F0] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#1E293B] transition-all"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {showShare && (
            <button
              onClick={onShareClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-[0.98] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2.5 border-l border-[#E2E8F0] dark:border-[#334155] pl-6">
          <Avatar
            memberId="usr_curr"
            name={userName}
            size="md"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] leading-tight">{userName}</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}

