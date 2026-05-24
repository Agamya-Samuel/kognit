import { Button } from '@edutech/ui';
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
      <Button
        variant={selectedDomain === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDomainChange(null)}
      >
        All Domains
      </Button>
      {domains.map((domain) => (
        <Button
          key={domain}
          variant={selectedDomain === domain ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDomainChange(domain)}
          className="capitalize"
        >
          {domain}
        </Button>
      ))}
    </div>
  );
}