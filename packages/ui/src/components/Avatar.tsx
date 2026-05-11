import * as React from 'react';
import { cn } from '../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

function Avatar({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const initials = fallback
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!src || imageError) {
    return (
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium',
          sizeClasses[size],
          className,
        )}
        role="img"
        aria-label={alt || fallback}
        {...props}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClasses[size], className)}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || fallback}
        className="aspect-square h-full w-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export { Avatar };
