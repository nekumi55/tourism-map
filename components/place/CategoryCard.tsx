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

  const colorVariants: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    cyan: {
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      glow: 'group-hover:shadow-cyan-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10 hover:bg-amber-500/20',
      text: 'text-amber-700',
      border: 'border-amber-200',
      glow: 'group-hover:shadow-amber-500/10',
    },
    rose: {
      bg: 'bg-rose-500/10 hover:bg-rose-500/20',
      text: 'text-rose-700',
      border: 'border-rose-200',
      glow: 'group-hover:shadow-rose-500/10',
    },
    indigo: {
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      glow: 'group-hover:shadow-indigo-500/10',
    },
  };

  const colors = colorVariants[category.color] || colorVariants.emerald;

  return (
    <Link
      href={`/explore?category=${category.id}`}
      className={`group p-6 rounded-3xl border bg-white shadow-soft hover:shadow-soft-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${colors.border} ${colors.glow}`}
    >
      <div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colors.bg} ${colors.text}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-base">
          {category.name}
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">
          {category.count} địa điểm
        </span>
        <span className="inline-flex items-center text-teal-600 font-medium group-hover:translate-x-1 transition-transform">
          Khám phá <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}
