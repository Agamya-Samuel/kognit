import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@edutech/ui';
import type { CourseSortOption } from '@/types/courses';

interface SortOption {
  label: string;
  value: CourseSortOption;
}

interface SortDropdownProps {
  value: CourseSortOption;
  onChange: (value: CourseSortOption) => void;
  className?: string;
}

const sortOptions: SortOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={className}>
      <Label htmlFor="sort" className="mb-1.5 block">
        Sort by
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="sort" className="w-full md:max-w-xs">
          <SelectValue placeholder="Select sort option" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}