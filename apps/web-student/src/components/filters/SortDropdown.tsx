interface SortOption {
  label: string;
  value: 'newest' | 'oldest' | 'popular' | 'rating' | 'price-low' | 'price-high';
}

interface SortDropdownProps {
  value: SortOption['value'];
  onChange: (value: SortOption['value']) => void;
  className?: string;
}

const sortOptions: SortOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
];

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={className}>
      <label htmlFor="sort" className="mb-1 block text-sm font-medium text-muted-foreground">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption['value'])}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
