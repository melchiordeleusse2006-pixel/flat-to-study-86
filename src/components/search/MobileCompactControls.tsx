import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Grid, Map, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import SearchFilters from './SearchFilters';
import { SearchFilters as SearchFiltersType } from '@/types';

type ViewMode = 'grid' | 'map';

interface MobileCompactControlsProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function MobileCompactControls({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: MobileCompactControlsProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
      {/* Filters Button */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 relative">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] z-[60]">
          <SheetHeader>
            <SheetTitle>Search Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SearchFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
              className="max-w-none"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sort Button */}
      <Sheet open={isSortOpen} onOpenChange={setIsSortOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto z-[60]">
          <SheetHeader>
            <SheetTitle>Sort By</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'newest', label: 'Newest First' },
              { value: 'distance', label: 'Distance' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  onSortChange(option.value);
                  setIsSortOpen(false);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* View Mode Toggle */}
      <div className="flex rounded-lg border">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="rounded-r-none border-r px-3"
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('map')}
          className="rounded-l-none px-3"
        >
          <Map className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}