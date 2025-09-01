import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '@/types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapViewProps {
  listings: Listing[];
  onListingClick?: (listingId: string) => void;
  onListingHover?: (listingId: string | null) => void;
  hoveredListingId?: string | null;
  className?: string;
}

export default function SimpleMapView({ 
  listings, 
  onListingClick,
  onListingHover,
  hoveredListingId,
  className 
}: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([45.4642, 9.1900], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (listings && listings.length > 0) {
      console.log('Placing markers for listings:', listings.map(l => ({
        id: l.id,
        title: l.title,
        address: l.addressLine,
        lat: l.lat,
        lng: l.lng
      })));
      
      const markers: L.Marker[] = [];
      
      listings.forEach((listing) => {
        const isHovered = hoveredListingId === listing.id;
        
        // Create custom marker with hover effect
        const markerIcon = L.divIcon({
          html: `
            <div style="
              background-color: ${isHovered ? 'white' : '#059669'};
              border: 2px solid ${isHovered ? '#3b82f6' : 'white'};
              border-radius: 50%;
              width: 16px;
              height: 16px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              transform: ${isHovered ? 'scale(1.3)' : 'scale(1)'};
              transition: all 0.2s ease;
            "></div>
          `,
          className: 'custom-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([listing.lat, listing.lng], { icon: markerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="width: 250px; padding: 8px;">
              <div style="display: flex; align-items: start; gap: 12px;">
                ${listing.images && listing.images[0] ? 
                  `<img src="${listing.images[0]}" alt="${listing.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0;" />` 
                  : ''
                }
                <div style="flex: 1; min-width: 0;">
                  <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; line-height: 1.3;">${listing.title}</h3>
                  <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">📍 ${listing.addressLine}</p>
                  <span style="font-weight: bold; font-size: 14px; color: #059669;">${formatPrice(listing.rentMonthlyEUR)}/month</span>
                </div>
              </div>
            </div>
          `);

        if (onListingClick) {
          marker.on('click', () => onListingClick(listing.id));
        }

        if (onListingHover) {
          marker.on('mouseover', () => onListingHover(listing.id));
          marker.on('mouseout', () => onListingHover(null));
        }
        
        markers.push(marker);
      });

      // Fit bounds to show all markers
      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }

    // Cleanup function
    return () => {
      // Markers will be cleared by the forEach loop above
    };
  }, [listings, onListingClick, onListingHover, hoveredListingId]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!listings || listings.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <p className="text-gray-500">No listings to display on map</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}