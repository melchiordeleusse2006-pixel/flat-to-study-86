import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SearchFilters, ListingType } from '@/types';
import { universities, commonAmenities } from '@/data/mockData';
import { Filter, X, Euro, MapPin, Home, Bed, Sofa, Wifi } from 'lucide-react';

interface CompactFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function CompactFilters({ filters, onFiltersChange }: CompactFiltersProps) {
  const [priceRange, setPriceRange] = useState([filters.priceMin || 400, filters.priceMax || 1500]);
  const [isOpen, setIsOpen] = useState(false);

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

  const hasActiveFilters = () => {
    return (filters.priceMin !== undefined || filters.priceMax !== undefined) ||
           (filters.type && filters.type.length > 0) ||
           filters.bedrooms !== undefined ||
           filters.furnished !== undefined ||
           (filters.amenities && filters.amenities.length > 0) ||
           filters.universityId ||
           filters.availabilityDate;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.furnished) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    if (filters.universityId) count++;
    if (filters.availabilityDate) count++;
    return count;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={hasActiveFilters() ? "default" : "outline"} size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters() && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filters
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Euro className="h-4 w-4 mr-2" />
              Price Range (Monthly)
            </Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={2000}
                min={300}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>€{priceRange[0]}</span>
                <span>€{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Property Type
            </Label>
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

          {/* Availability Date */}
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

          {/* University */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Near University
            </Label>
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

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Bed className="h-4 w-4 mr-2" />
              Bedrooms
            </Label>
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="furnished"
                checked={filters.furnished || false}
                onCheckedChange={(checked) => onFiltersChange({ 
                  ...filters, 
                  furnished: checked ? true : undefined 
                })}
              />
              <Label htmlFor="furnished" className="text-sm flex items-center">
                <Sofa className="h-4 w-4 mr-2" />
                Furnished
              </Label>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              Amenities
            </Label>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}