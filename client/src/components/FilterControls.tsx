import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { GetItemsQuery } from '../../../server/src/schema';

interface FilterControlsProps {
  filters: GetItemsQuery;
  onFiltersChange: (filters: Partial<GetItemsQuery>) => void;
  onSearch: () => void;
  isLoading: boolean;
  categories: string[];
}

export function FilterControls({
  filters,
  onFiltersChange,
  onSearch,
  isLoading,
  categories
}: FilterControlsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000
  ]);
  const [ratingFilter, setRatingFilter] = useState(filters.minRating || 0);

  const handleReset = () => {
    setSearchTerm('');
    setPriceRange([0, 1000]);
    setRatingFilter(0);
    onFiltersChange({
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange({
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      minRating: ratingFilter > 0 ? ratingFilter : undefined
    });
    onSearch();
  };

  return (
    <Card className="glassmorphism border-white/20 p-6 mb-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="text-white/70" size={20} />
        <h2 className="text-xl font-semibold text-white">Filters & Search</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm font-medium">Search Items</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm font-medium">Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => onFiltersChange({
              category: value === 'all' ? undefined : value
            })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-white/70 text-sm font-medium">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label className="text-white/70 text-sm font-medium">
            Minimum Rating: {ratingFilter > 0 ? `${ratingFilter.toFixed(1)}★` : 'Any'}
          </Label>
          <Slider
            value={[ratingFilter]}
            onValueChange={([value]) => setRatingFilter(value)}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleReset}
          className="text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset Filters
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm">
            Showing {filters.limit} items per page
          </span>
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="gradient-bg-cool hover:shadow-lg hover:shadow-blue-500/25 text-white font-medium px-6"
          >
            {isLoading ? 'Searching...' : 'Apply Filters'}
          </Button>
        </div>
      </div>
    </Card>
  );
}