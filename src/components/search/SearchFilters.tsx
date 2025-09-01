import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchFilters, ListingType } from '@/types';
import { universities, commonAmenities } from '@/data/mockData';
import { Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export default function SearchFiltersComponent({ filters, onFiltersChange, className }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.priceMin || 400, filters.priceMax || 1500]);

  const listingTypes: { value: ListingType; label: string }[] = [
    { value: 'room', label: 'Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'apartment', label: 'Apartment' }
  ];

  const handleTypeChange = (type: ListingType, checked: boolean) => {
    const currentTypes = filters.type || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    onFiltersChange({ ...filters, type: newTypes });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = checked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter(a => a !== amenity);
    
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({ 
      ...filters, 
      priceMin: values[0], 
      priceMax: values[1] 
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setPriceRange([400, 1500]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.furnished !== undefined) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    if (filters.universityId) count++;
    return count;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range (Monthly)</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={2000}
              min={300}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>€{priceRange[0]}</span>
              <span>€{priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* University */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Near University</Label>
          <Select 
            value={filters.universityId || 'any'} 
            onValueChange={(value) => onFiltersChange({ ...filters, universityId: value === 'any' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any university</SelectItem>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className={`space-y-3 ${!isExpanded ? 'hidden md:block' : ''}`}>
          <Label className="text-sm font-medium">Property Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {listingTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={type.value}
                  checked={filters.type?.includes(type.value) || false}
                  onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                />
                <Label htmlFor={type.value} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className={`space-y-3 ${!isExpanded ? 'hidden md:block' : ''}`}>
          <Label className="text-sm font-medium">Bedrooms</Label>
          <Select 
            value={filters.bedrooms?.toString() || 'any'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              bedrooms: value === 'any' ? undefined : parseInt(value) 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1 bedroom</SelectItem>
              <SelectItem value="2">2 bedrooms</SelectItem>
              <SelectItem value="3">3+ bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Furnished */}
        <div className={`space-y-3 ${!isExpanded ? 'hidden md:block' : ''}`}>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="furnished"
              checked={filters.furnished || false}
              onCheckedChange={(checked) => onFiltersChange({ 
                ...filters, 
                furnished: checked ? true : undefined 
              })}
            />
            <Label htmlFor="furnished" className="text-sm font-medium">
              Furnished only
            </Label>
          </div>
        </div>

        {/* Amenities */}
        <div className={`space-y-3 ${!isExpanded ? 'hidden md:block' : ''}`}>
          <Label className="text-sm font-medium">Amenities</Label>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {commonAmenities.slice(0, 8).map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox 
                  id={amenity}
                  checked={filters.amenities?.includes(amenity) || false}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                />
                <Label htmlFor={amenity} className="text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Date */}
        <div className={`space-y-3 ${!isExpanded ? 'hidden md:block' : ''}`}>
          <Label className="text-sm font-medium">Available From</Label>
          <Input 
            type="date"
            value={filters.availabilityDate || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              availabilityDate: e.target.value || undefined 
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}