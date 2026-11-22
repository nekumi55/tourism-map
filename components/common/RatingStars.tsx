import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export default function RatingStars({
  rating,
  reviews,
  size = 'sm',
  showNumber = true,
}: RatingStarsProps) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSizes[size]} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className={`${textSizes[size]} font-medium text-slate-700`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviews !== undefined && (
        <span className={`${textSizes[size]} text-slate-500`}>
          ({reviews})
        </span>
      )}
    </div>
  );
}
