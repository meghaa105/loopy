
import React, { useState } from 'react';
import { Member } from '../types.ts';

interface MemberAvatarProps {
  member: Member;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const FALLBACK_COLORS = [
  'bg-amber-200 text-amber-900',
  'bg-violet-200 text-violet-900',
  'bg-emerald-200 text-emerald-900',
  'bg-rose-200 text-rose-900',
  'bg-sky-200 text-sky-900',
  'bg-orange-200 text-orange-900',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorClass = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-8 h-8 text-[8px]',
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
  };

  const commonClasses = `rounded-full border-2 border-black flex-shrink-0 flex items-center justify-center font-black transition-all shadow-[2px_2px_0px_0px_#000] object-cover bg-white ${sizeClasses[size]} ${className}`;

  if (!member.avatar || imgError) {
    return (
      <div 
        className={`${commonClasses} ${getColorClass(member.name)}`}
        title={member.name}
      >
        {getInitials(member.name)}
      </div>
    );
  }

  return (
    <img 
      src={member.avatar} 
      onError={() => setImgError(true)}
      className={commonClasses}
      title={member.name}
      alt={member.name}
    />
  );
};
