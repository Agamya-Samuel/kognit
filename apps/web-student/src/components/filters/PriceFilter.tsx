import { cn } from '@edutech/ui';

interface PriceFilterProps {
  selectedPricing: 'all' | 'free' | 'paid';
  onPricingChange: (pricing: 'all' | 'free' | 'paid') => void;
  className?: string;
}

export function PriceFilter({
  selectedPricing,
  onPricingChange,
  className,
}: PriceFilterProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {(['all', 'free', 'paid'] as const).map((option) => (
        <button
          key={option}
          onClick={() => onPricingChange(option)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors capitalize',
            selectedPricing === option
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {option === 'all' ? 'All Prices' : option}
        </button>
      ))}
    </div>
  );
}
