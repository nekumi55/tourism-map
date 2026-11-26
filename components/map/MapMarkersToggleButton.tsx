'use client';

import React from 'react';
import { MapPin, MapPinOff } from 'lucide-react';

interface MapMarkersToggleButtonProps {
  showMarkers: boolean;
  onToggle: () => void;
  compact?: boolean;
  showLabel?: string;
  hideLabel?: string;
  className?: string;
}

export default function MapMarkersToggleButton({
  showMarkers,
  onToggle,
  compact = false,
  showLabel = 'Hiện đánh dấu',
  hideLabel = 'Ẩn đánh dấu',
  className = '',
}: MapMarkersToggleButtonProps) {
  const label = showMarkers ? hideLabel : showLabel;
  const ariaLabel = showMarkers ? hideLabel : showLabel;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={showMarkers}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`${
        compact
          ? 'min-h-11 min-w-10 px-2.5 flex items-center justify-center'
          : 'min-h-11 px-3.5 text-xs font-semibold flex items-center gap-1.5'
      } rounded-xl shadow-soft-xl border backdrop-blur-md transition-colors duration-200 cursor-pointer ${
        showMarkers
          ? 'bg-[var(--accent-jade)] text-[#FFFDF9] border-[var(--accent-jade)]'
          : 'bg-[var(--bg-surface)]/95 text-[var(--ink-primary)] hover:text-[var(--accent-jade)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)]'
      } ${className}`}
    >
      {showMarkers ? (
        <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <MapPinOff
          className={`w-4 h-4 shrink-0 ${compact ? '' : 'text-[var(--accent-jade)]'}`}
          aria-hidden="true"
        />
      )}
      {!compact && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
