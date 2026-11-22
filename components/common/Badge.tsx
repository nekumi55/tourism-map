import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    secondary: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    accent: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    success: 'bg-green-50 text-green-700 border border-green-200/80',
    warning: 'bg-orange-50 text-orange-700 border border-orange-200/80',
    outline: 'bg-white/80 text-slate-700 border border-slate-200 backdrop-blur-xs',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
