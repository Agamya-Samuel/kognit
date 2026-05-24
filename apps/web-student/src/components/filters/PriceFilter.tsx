import { Button } from '@edutech/ui';
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
        <Button
          key={option}
          variant={selectedPricing === option ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPricingChange(option)}
          className="capitalize"
        >
          {option === 'all' ? 'All Prices' : option}
        </Button>
      ))}
    </div>
  );
}