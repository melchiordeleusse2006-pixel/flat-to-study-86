import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '@/types';

interface MapboxMapProps {
  listings: Listing[];
  className?: string;
  onListingClick?: (listingId: string) => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGVvZG9yY29zbW92aWNpIiwiYSI6ImNtZjBtZTVpbTBycHAycXB6ZXMyNTIxN2MifQ.WwIXUME99huK3RfubI_baQ';

export default function MapboxMap({ listings, className, onListingClick }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [9.1900, 45.4642], // Milan coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (listings.length === 0) return;

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();

    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng) return;

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
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'listing-popup'
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-1">${listing.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${listing.addressLine}</p>
          <div class="flex justify-between items-center">
            <span class="font-bold text-primary">${price}/month</span>
            <span class="text-xs text-gray-500">${listing.bedrooms} bed</span>
          </div>
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
  }, [listings, onListingClick]);

  return (
    <div className={className}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg border"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}