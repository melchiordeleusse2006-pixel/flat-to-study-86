import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { SearchFilters, ListingType } from '@/types';
import { universities, commonAmenities } from '@/data/mockData';
import { ChevronDown, X, Euro, MapPin, Home, Bed, Sofa, Wifi } from 'lucide-react';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export default function SearchFiltersComponent({ filters, onFiltersChange, className }: SearchFiltersProps) {
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

  const getPriceLabel = () => {
    if (filters.priceMin || filters.priceMax) {
      return `€${filters.priceMin || 400} - €${filters.priceMax || 1500}`;
    }
    return 'Price';
  };

  const getTypeLabel = () => {
    if (filters.type && filters.type.length > 0) {
      if (filters.type.length === 1) {
        return listingTypes.find(t => t.value === filters.type![0])?.label || 'Type';
      }
      return `${filters.type.length} types`;
    }
    return 'Type';
  };

  const getUniversityLabel = () => {
    if (filters.universityId) {
      const uni = universities.find(u => u.id === filters.universityId);
      return uni?.name || 'University';
    }
    return 'University';
  };

  const getBedroomsLabel = () => {
    if (filters.bedrooms) {
      return filters.bedrooms === 3 ? '3+ bedrooms' : `${filters.bedrooms} bedroom${filters.bedrooms > 1 ? 's' : ''}`;
    }
    return 'Bedrooms';
  };

  const getAmenitiesLabel = () => {
    if (filters.amenities && filters.amenities.length > 0) {
      if (filters.amenities.length === 1) {
        return filters.amenities[0];
      }
      return `${filters.amenities.length} amenities`;
    }
    return 'Amenities';
  };

  const hasActiveFilters = () => {
    return (filters.priceMin !== undefined || filters.priceMax !== undefined) ||
           (filters.type && filters.type.length > 0) ||
           filters.bedrooms !== undefined ||
           filters.furnished !== undefined ||
           (filters.amenities && filters.amenities.length > 0) ||
           filters.universityId ||
           filters.availabilityDate;
  };

  return (
    <div className={`${className} bg-background border-b`}>
      <div className="flex items-center gap-2 p-4 overflow-x-auto scrollbar-hide">
        {/* Price Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.priceMin || filters.priceMax ? "default" : "outline"} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <Euro className="h-4 w-4 mr-1" />
              {getPriceLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-50">
            <div className="space-y-4">
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
          </PopoverContent>
        </Popover>

        {/* Property Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.type && filters.type.length > 0 ? "default" : "outline"} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <Home className="h-4 w-4 mr-1" />
              {getTypeLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-50">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Property Type</Label>
              <div className="space-y-2">
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
          </PopoverContent>
        </Popover>

        {/* Availability Date Filter - Third position */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.availabilityDate ? "default" : "outline"} 
              size="sm" 
              className="whitespace-nowrap"
            >
              Available From
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-50">
            <div className="space-y-3">
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
          </PopoverContent>
        </Popover>

        {/* University Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.universityId ? "default" : "outline"} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <MapPin className="h-4 w-4 mr-1" />
              {getUniversityLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-50">
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
          </PopoverContent>
        </Popover>

        {/* Bedrooms Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.bedrooms ? "default" : "outline"} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <Bed className="h-4 w-4 mr-1" />
              {getBedroomsLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-50">
            <div className="space-y-3">
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
          </PopoverContent>
        </Popover>

        {/* Furnished Filter */}
        <Button 
          variant={filters.furnished ? "default" : "outline"} 
          size="sm" 
          className="whitespace-nowrap"
          onClick={() => onFiltersChange({ 
            ...filters, 
            furnished: filters.furnished ? undefined : true 
          })}
        >
          <Sofa className="h-4 w-4 mr-1" />
          Furnished
        </Button>

        {/* Amenities Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.amenities && filters.amenities.length > 0 ? "default" : "outline"} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <Wifi className="h-4 w-4 mr-1" />
              {getAmenitiesLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-50">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Amenities</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {hasActiveFilters() && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground whitespace-nowrap ml-2"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}