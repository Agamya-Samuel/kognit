import { cn } from '@edutech/ui';

interface DomainFilterProps {
  domains: string[];
  selectedDomain: string | null;
  onDomainChange: (domain: string | null) => void;
  className?: string;
}

export function DomainFilter({
  domains,
  selectedDomain,
  onDomainChange,
  className,
}: DomainFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onDomainChange(null)}
        className={cn(
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          selectedDomain === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        All Domains
      </button>
      {domains.map((domain) => (
        <button
          key={domain}
          onClick={() => onDomainChange(domain)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize',
            selectedDomain === domain
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {domain}
        </button>
      ))}
    </div>
  );
}
