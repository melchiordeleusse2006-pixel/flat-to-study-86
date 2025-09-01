import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ListingCard from '@/components/listings/ListingCard';
import SearchFilters from '@/components/search/SearchFilters';
import SimpleMapView from '@/components/map/SimpleMapView';
import { Listing, SearchFilters as SearchFiltersType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { geocodeAllListings } from '@/utils/geocoding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, Grid, Map, MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'map';

export default function Search() {
  const isMobile = useIsMobile();
  const [listings, setListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'map');
  const [loading, setLoading] = useState(true);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [geocodingComplete, setGeocodingComplete] = useState(false);
  const [visibleListings, setVisibleListings] = useState<Listing[]>([]);

  // Fetch listings from database
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Use the secure function to get listings with agency names only
        const { data, error } = await supabase.rpc('get_listings_with_agency', {
          p_limit: 100,
          p_offset: 0
        });

        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }

        // Transform the data to match our Listing type
        const transformedListings: Listing[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          description: item.description,
          addressLine: item.address_line,
          city: item.city,
          country: item.country,
          lat: item.lat,
          lng: item.lng,
          rentMonthlyEUR: item.rent_monthly_eur,
          depositEUR: item.deposit_eur,
          billsIncluded: item.bills_included,
          furnished: item.furnished,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          floor: item.floor,
          sizeSqm: item.size_sqm,
          amenities: item.amenities || [],
          availabilityDate: item.availability_date,
          images: item.images || [],
          videoUrl: item.video_url,
          createdAt: item.created_at,
          publishedAt: item.published_at,
          status: item.status,
          agency: {
            id: item.id, // Using listing id as agency id for now
            ownerUserId: '',
            name: item.agency_name || 'Unknown Agency',
            phone: '', // Contact info no longer exposed for security
            billingEmail: '', // Contact info no longer exposed for security
            createdAt: item.created_at
          }
        }));

        setAllListings(transformedListings);
        
        // Auto-geocode listings if not done yet
        if (!geocodingComplete && transformedListings.length > 0) {
          handleGeocodeAll();
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings based on search criteria
  useEffect(() => {
    let filtered = [...allListings];

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
    // Initialize visible listings for map view
    if (viewMode === 'map') {
      setVisibleListings(filtered);
    }
  }, [searchQuery, filters, sortBy, allListings, viewMode]);

  const handleListingClick = (listingId: string) => {
    // In a real app, this would navigate to the listing detail page
    console.log('Opening listing:', listingId);
    window.open(`/listing/${listingId}`, '_blank');
  };

  const handleGeocodeAll = async () => {
    try {
      console.log('Auto-geocoding listings...');
      const result = await geocodeAllListings();
      console.log('Geocoding results:', result);
      setGeocodingComplete(true);
      
      // Refresh listings after geocoding
      setTimeout(() => {
        fetchListings();
      }, 1000);
      
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_listings_with_agency', {
        p_limit: 100,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      const transformedListings: Listing[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        description: item.description,
        addressLine: item.address_line,
        city: item.city,
        country: item.country,
        lat: item.lat,
        lng: item.lng,
        rentMonthlyEUR: item.rent_monthly_eur,
        depositEUR: item.deposit_eur,
        billsIncluded: item.bills_included,
        furnished: item.furnished,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        floor: item.floor,
        sizeSqm: item.size_sqm,
        amenities: item.amenities || [],
        availabilityDate: item.availability_date,
        images: item.images || [],
        videoUrl: item.video_url,
        createdAt: item.created_at,
        publishedAt: item.published_at,
        status: item.status,
        agency: {
          id: item.id,
          ownerUserId: '',
          name: item.agency_name || 'Unknown Agency',
          phone: '',
          billingEmail: '',
          createdAt: item.created_at
        }
      }));

      setAllListings(transformedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleMapBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
    const visible = listings.filter(listing => 
      listing.lat >= bounds.south && 
      listing.lat <= bounds.north && 
      listing.lng >= bounds.west && 
      listing.lng <= bounds.east
    );
    setVisibleListings(visible);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Bar - Sticky below header */}
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur mt-4">
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
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-l-none"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filters - Sticky below search bar */}
      <div className="sticky top-[152px] z-30 border-b bg-background/95 backdrop-blur">
        <SearchFilters 
          filters={filters}
          onFiltersChange={setFilters}
          className="max-w-none"
        />
      </div>

      {/* Main Content */}
      <div className="container py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading listings...</span>
          </div>
        ) : viewMode === 'map' ? (
          /* Map View - Mobile shows only map, Desktop shows 50/50 split */
          isMobile ? (
            <div className="h-[calc(100vh-280px)]">
              <SimpleMapView 
                listings={listings}
                onListingClick={handleListingClick}
                hoveredListingId={hoveredListingId}
                onListingHover={setHoveredListingId}
                onBoundsChange={handleMapBoundsChange}
                className="h-full w-full rounded-lg"
              />
            </div>
          ) : (
            <div className="flex gap-6 h-[calc(100vh-280px)]">
              {/* Listings Panel - Left Side */}
              <div className="w-1/2 flex flex-col">
                {/* Sort Section - Above listings, not sticky */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b bg-background px-2 py-2">
                  <p className="text-sm text-muted-foreground">
                    {visibleListings.length} properties in current view
                  </p>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 z-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-20">
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Scrollable listings */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid gap-4 pr-2">
                    {visibleListings.map((listing) => (
                      <div
                        key={listing.id}
                        onMouseEnter={() => setHoveredListingId(listing.id)}
                        onMouseLeave={() => setHoveredListingId(null)}
                      >
                        <ListingCard
                          listing={listing}
                          onClick={() => handleListingClick(listing.id)}
                          className="cursor-pointer"
                        />
                      </div>
                    ))}
                    
                    {visibleListings.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No properties in current view.</p>
                        <p className="text-sm text-muted-foreground mt-2">Move the map to see listings in different areas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Map - Right Side */}
              <div className="w-1/2">
                <SimpleMapView 
                  listings={listings}
                  onListingClick={handleListingClick}
                  hoveredListingId={hoveredListingId}
                  onListingHover={setHoveredListingId}
                  onBoundsChange={handleMapBoundsChange}
                  className="h-full w-full rounded-lg"
                />
              </div>
            </div>
          )
        ) : (
          /* Grid View */
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
        )}
      </div>
    </div>
  );
}
