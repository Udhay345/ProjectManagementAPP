import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  memberId: string;
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Avatar({ memberId, name, className = '', size = 'md' }: AvatarProps) {
  const getAvatarColors = (id: string) => {
    // List of premium dark background + light foreground colors matching user preference
    const colorPairs = [
      { bg: 'bg-[#0D2A26] border-[#133F39]', text: 'text-[#2DD4BF]' }, // Teal
      { bg: 'bg-[#0E1B2E] border-[#142B47]', text: 'text-[#38BDF8]' }, // Blue
      { bg: 'bg-[#1D102F] border-[#2C1947]', text: 'text-[#C084FC]' }, // Violet
      { bg: 'bg-[#240F1D] border-[#37162C]', text: 'text-[#F472B6]' }, // Pink/Rose
      { bg: 'bg-[#22170B] border-[#352310]', text: 'text-[#FBBF24]' }, // Amber
      { bg: 'bg-[#0F2916] border-[#173F22]', text: 'text-[#34D399]' }, // Emerald
      { bg: 'bg-[#1B122C] border-[#2A1D44]', text: 'text-[#818CF8]' }  // Indigo
    ];

    // Stable color selection based on member id hash
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    return colorPairs[sum % colorPairs.length];
  };

  const colors = getAvatarColors(memberId);

  const sizeClasses = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
    xl: 'w-8.5 h-8.5'
  };

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-full border shadow-sm select-none shrink-0 ${colors.bg} ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <User className={`${colors.text} ${iconSizes[size]} fill-current stroke-[1.5]`} />
    </div>
  );
}
