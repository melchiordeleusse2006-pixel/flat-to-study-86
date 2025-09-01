import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '@/types';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapboxMapProps {
  listings: Listing[];
  className?: string;
  onListingClick?: (listingId: string) => void;
}

// OpenStreetMap fallback component
const OpenStreetMapFallback = ({ listings, className, onListingClick }: MapboxMapProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Custom icon for listings
  const listingIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="35" viewBox="0 0 25 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 21.875 12.5 35 12.5 35C12.5 35 25 21.875 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="#3B82F6"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [25, 35],
    iconAnchor: [12.5, 35],
    popupAnchor: [0, -35],
  });

  return (
    <div className={className}>
      <div className="relative w-full h-full rounded-lg overflow-hidden border" style={{ minHeight: '400px' }}>
        <div className="absolute top-2 left-2 z-[1000] bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Using OpenStreetMap fallback
        </div>
        <MapContainer 
          center={[45.4642, 9.1900]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={listingIcon}
            >
              <Popup maxWidth={300} closeButton={false}>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-3">
                    {listing.images[0] && (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{listing.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {listing.addressLine}, {listing.city}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(listing.rentMonthlyEUR)}
                        <span className="text-xs text-muted-foreground font-normal">/month</span>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        if (onListingClick) {
                          onListingClick(listing.id);
                        } else {
                          navigate(`/listing/${listing.id}`);
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// Mapbox component with error handling
const MapboxMap = ({ listings, className, onListingClick }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setMapError('Failed to load Mapbox token');
          setIsLoading(false);
          return;
        }

        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setMapError('Mapbox token not available');
        }
      } catch (error) {
        console.error('Error invoking get-mapbox-token function:', error);
        setMapError('Failed to connect to Mapbox service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || mapError) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Standard Mapbox style
        center: [9.1900, 45.4642], // Milan coordinates [lng, lat]
        zoom: 12,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Mapbox rendering error');
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapError('Failed to initialize Mapbox map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, mapError]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current || mapError) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (listings.length === 0) return;

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();

    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng || !map.current) return;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'mapbox-marker';
      markerElement.style.cssText = `
        width: 32px;
        height: 32px;
        background: hsl(var(--primary));
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: transform 0.2s ease;
      `;
      
      // Add price to marker
      const price = new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(listing.rentMonthlyEUR);
      
      markerElement.innerHTML = `€${Math.round(listing.rentMonthlyEUR / 100)}k`;

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1)';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([listing.lng, listing.lat])
        .addTo(map.current);

      // Create popup with improved preview
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'listing-popup'
      }).setHTML(`
        <div class="p-4 min-w-[250px] cursor-pointer" onclick="window.open('/listing/${listing.id}', '_blank')">
          ${listing.images[0] ? `<img src="${listing.images[0]}" alt="${listing.title}" class="w-full h-24 object-cover rounded-lg mb-2">` : ''}
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${listing.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${listing.addressLine}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-blue-600">${price}/month</span>
            <span class="text-xs text-gray-500">${listing.bedrooms} bed • ${listing.bathrooms} bath</span>
          </div>
          <div class="text-xs text-gray-500">
            ${listing.furnished ? '• Furnished' : '• Unfurnished'} • ${listing.sizeSqm ? listing.sizeSqm + ' m²' : 'Size N/A'}
          </div>
          <div class="text-xs text-blue-600 mt-2 font-medium">Click to view details →</div>
        </div>
      `);

      marker.setPopup(popup);

      // Add click handler
      markerElement.addEventListener('click', () => {
        if (onListingClick) {
          onListingClick(listing.id);
        }
      });

      markers.current.push(marker);
      bounds.extend([listing.lng, listing.lat]);
    });

    // Fit map to show all markers
    if (listings.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [listings, onListingClick, mapError]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        <div className="w-full h-full rounded-lg border flex items-center justify-center bg-muted" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state or fallback to OpenStreetMap
  if (mapError || !mapboxToken) {
    console.log('Falling back to OpenStreetMap due to:', mapError || 'No Mapbox token');
    return <OpenStreetMapFallback listings={listings} className={className} onListingClick={onListingClick} />;
  }

  // Render Mapbox map
  return (
    <div className={className}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg border"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default MapboxMap;