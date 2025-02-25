import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface RatingStarsProps {
  value: number | null;
  onChange: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({ 
  value, 
  onChange, 
  readonly = false,
  size = 'md'
}: RatingStarsProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => !readonly && onChange(rating)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
          )}
          disabled={readonly}
        >
          <Star
            className={cn(
              sizes[size],
              "transition-colors",
              rating <= (value || 0)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-400"
            )}
          />
        </button>
      ))}
    </div>
  );
}