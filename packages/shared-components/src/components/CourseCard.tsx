import { cn } from '@edutech/ui';

export interface CourseCardProps {
  title: string;
  description?: string;
  domain: string;
  thumbnailUrl?: string | null;
  pricingType: 'free' | 'paid';
  priceInr?: number;
  isPublished?: boolean;
  onClick?: () => void;
  className?: string;
}

function CourseCard({
  title,
  description,
  domain,
  thumbnailUrl,
  pricingType,
  priceInr,
  isPublished,
  onClick,
  className,
}: CourseCardProps) {
  return (
    <div
      className={cn(
        'group cursor-pointer overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {thumbnailUrl ? (
        <div className="aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted">
          <span className="text-4xl text-muted-foreground">📚</span>
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {domain}
          </span>
          {isPublished !== undefined && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                isPublished
                  ? 'bg-[hsl(var(--success))] text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>
          )}
        </div>

        <h3 className="mb-1 line-clamp-2 font-semibold leading-tight">{title}</h3>

        {description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-medium', pricingType === 'paid' ? 'text-foreground' : 'text-[hsl(var(--success))]')}>
            {pricingType === 'free' ? 'Free' : `₹${((priceInr ?? 0) / 100).toFixed(0)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export { CourseCard };
