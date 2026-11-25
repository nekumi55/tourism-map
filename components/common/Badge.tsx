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
    primary:
      'bg-[var(--accent-jade-soft)] text-[var(--accent-jade-ink)] border border-[var(--accent-jade)]/20',
    secondary:
      'bg-[var(--bg-surface-muted)] text-[var(--ink-secondary)] border border-[var(--border-subtle)]',
    accent:
      'bg-[var(--accent-ochre-soft)] text-[var(--accent-ochre-ink)] border border-[var(--accent-ochre)]/25',
    success:
      'bg-[#E5F2EC] text-[#0E563B] border border-[#0E563B]/20',
    warning:
      'bg-[#FBF2E4] text-[#7C3A06] border border-[#B45309]/25',
    outline:
      'bg-[var(--bg-surface)]/95 text-[var(--ink-primary)] border border-[var(--border-subtle)] backdrop-blur-xs',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-md font-semibold',
    md: 'text-xs px-3 py-1 rounded-md font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
