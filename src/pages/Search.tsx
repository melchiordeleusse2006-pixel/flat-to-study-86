import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ListingCard from '@/components/listings/ListingCard';
import SearchFilters from '@/components/search/SearchFilters';
import { mockListings } from '@/data/mockData';
import { Listing, SearchFilters as SearchFiltersType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, List, Grid } from 'lucide-react';

type ViewMode = 'list' | 'grid';

export default function Search() {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter listings based on search criteria
  useEffect(() => {
    let filtered = [...mockListings];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.addressLine.toLowerCase().includes(query) ||
        listing.city.toLowerCase().includes(query) ||
        listing.amenities.some(amenity => amenity.toLowerCase().includes(query))
      );
    }

    // Price range
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(listing => listing.rentMonthlyEUR >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(listing => listing.rentMonthlyEUR <= filters.priceMax!);
    }

    // Property type
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(listing => filters.type!.includes(listing.type));
    }

    // Bedrooms
    if (filters.bedrooms !== undefined) {
      if (filters.bedrooms === 3) {
        filtered = filtered.filter(listing => listing.bedrooms >= 3);
      } else {
        filtered = filtered.filter(listing => listing.bedrooms === filters.bedrooms);
      }
    }

    // Furnished
    if (filters.furnished) {
      filtered = filtered.filter(listing => listing.furnished);
    }

    // Amenities
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(listing =>
        filters.amenities!.every(amenity => listing.amenities.includes(amenity))
      );
    }

    // Availability date
    if (filters.availabilityDate) {
      filtered = filtered.filter(listing => 
        new Date(listing.availabilityDate) <= new Date(filters.availabilityDate!)
      );
    }

    // Sort results
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.rentMonthlyEUR - b.rentMonthlyEUR);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.rentMonthlyEUR - a.rentMonthlyEUR);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setListings(filtered);
  }, [searchQuery, filters, sortBy]);

  const handleListingClick = (listingId: string) => {
    // In a real app, this would navigate to the listing detail page
    console.log('Opening listing:', listingId);
    window.open(`/listing/${listingId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Bar */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by location, university, or amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none border-r"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {listings.length} properties found
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <SearchFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* List/Grid View */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => handleListingClick(listing.id)}
                  className="cursor-pointer"
                />
              ))}
              
              {listings.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No properties match your search criteria.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({})}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
