import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { Trees, Palmtree, Landmark, Utensils, Compass, ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trees,
  Palmtree,
  Landmark,
  Utensils,
  Compass,
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = ICON_MAP[category.icon] || Compass;

  const toneVariants: Record<string, { iconBg: string; iconText: string }> = {
    emerald: {
      iconBg: 'bg-[var(--accent-jade-soft)]',
      iconText: 'text-[var(--accent-jade)]',
    },
    cyan: {
      iconBg: 'bg-[#E1EFEF]',
      iconText: 'text-[#0E5A63]',
    },
    amber: {
      iconBg: 'bg-[var(--accent-ochre-soft)]',
      iconText: 'text-[var(--accent-ochre)]',
    },
    rose: {
      iconBg: 'bg-[#F6EAE6]',
      iconText: 'text-[#9A3412]',
    },
    indigo: {
      iconBg: 'bg-[var(--bg-surface-muted)]',
      iconText: 'text-[var(--ink-primary)]',
    },
  };

  const tone = toneVariants[category.color] || toneVariants.emerald;

  return (
    <Link
      href={`/explore?category=${category.id}`}
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent-jade)]"
    >
      <div className="atlas-card h-full p-6 flex flex-col justify-between">
        <div>
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-transform duration-250 ease-[var(--motion-ease-out)] group-hover:scale-105 ${tone.iconBg} ${tone.iconText}`}
            >
            <IconComponent className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-sans font-bold text-lg text-[var(--ink-primary)] tracking-tight group-hover:text-[var(--accent-jade)] transition-colors">
            {category.name}
          </h3>
          <p className="mt-1.5 text-xs text-[var(--ink-muted)] font-normal line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--ink-secondary)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-md tabular-nums">
            {category.count} địa điểm
          </span>
          <span className="inline-flex items-center text-[var(--accent-jade)] font-bold group-hover:translate-x-0.5 transition-transform duration-200">
            Xem danh mục <ChevronRight className="w-3.5 h-3.5 ml-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
