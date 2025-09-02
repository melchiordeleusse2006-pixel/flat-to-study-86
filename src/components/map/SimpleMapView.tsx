import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '@/types';
import './map-styles.css';

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
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  hoveredListingId?: string | null;
  className?: string;
}

export default function SimpleMapView({ 
  listings, 
  onListingClick,
  onListingHover,
  onBoundsChange,
  hoveredListingId,
  className 
}: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const initialBoundsSet = useRef(false);

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
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: false, // Disable double click zoom
        boxZoom: false, // Disable box zoom
        keyboard: false // Disable keyboard navigation
      }).setView([45.4642, 9.1900], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add bounds change listener
      if (onBoundsChange) {
        mapInstanceRef.current.on('moveend', () => {
          const bounds = mapInstanceRef.current!.getBounds();
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          });
        });
      }
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
        const price = formatPrice(listing.rentMonthlyEUR);
        
        // Create custom marker with price and hover effect
        const markerIcon = L.divIcon({
          html: `
            <div style="
              background-color: ${isHovered ? 'white' : '#059669'};
              border: 2px solid ${isHovered ? '#3b82f6' : 'white'};
              border-radius: 8px;
              padding: 4px 8px;
              font-size: 12px;
              font-weight: 600;
              color: ${isHovered ? '#3b82f6' : 'white'};
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              transform: ${isHovered ? 'scale(1.1)' : 'scale(1)'};
              transition: all 0.2s ease;
              white-space: nowrap;
              text-align: center;
            ">${price}</div>
          `,
          className: 'custom-price-marker',
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        const marker = L.marker([listing.lat, listing.lng], { icon: markerIcon })
          .addTo(map)
          .bindTooltip(`
            <div style="min-width: 200px; padding: 8px;">
              <div style="display: flex; align-items: start; gap: 8px;">
                ${listing.images && listing.images[0] ? 
                  `<img src="${listing.images[0]}" alt="${listing.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" />` 
                  : '<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 6px; flex-shrink: 0;"></div>'
                }
                <div style="flex: 1; min-width: 0;">
                  <h4 style="font-weight: 600; font-size: 13px; margin: 0 0 4px 0; line-height: 1.3; color: #111827;">${listing.title}</h4>
                  <p style="font-size: 12px; color: #6b7280; margin: 0 0 6px 0;">📍 ${listing.addressLine}</p>
                  <div style="font-weight: bold; font-size: 14px; color: #059669; margin-bottom: 6px;">${price}/month</div>
                  <div style="display: flex; gap: 8px; font-size: 11px; color: #6b7280;">
                    ${listing.bedrooms > 0 ? `<span>🛏️ ${listing.bedrooms}</span>` : ''}
                    ${listing.bathrooms > 0 ? `<span>🚿 ${listing.bathrooms}</span>` : ''}
                    ${listing.sizeSqm ? `<span>📐 ${listing.sizeSqm}m²</span>` : ''}
                    ${listing.furnished ? '<span>🪑 Furnished</span>' : ''}
                  </div>
                </div>
              </div>
            </div>
          `, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'custom-tooltip'
          });

        if (onListingClick) {
          marker.on('click', () => onListingClick(listing.id));
        }

        if (onListingHover) {
          marker.on('mouseover', (e) => {
            onListingHover(listing.id);
            // Prevent any default zoom behavior
            e.originalEvent?.stopPropagation();
          });
          marker.on('mouseout', (e) => {
            onListingHover(null);
            // Prevent any default zoom behavior
            e.originalEvent?.stopPropagation();
          });
        }
        
        markers.push(marker);
      });

      // Only fit bounds on initial load, not on every update
      if (markers.length > 0 && !initialBoundsSet.current) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
        initialBoundsSet.current = true;
      }
    }

    // Cleanup function
    return () => {
      // Markers will be cleared by the forEach loop above
    };
  }, [listings, onListingClick, onListingHover, hoveredListingId, onBoundsChange]);

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
    <div className={`${className} relative z-0`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '320px', position: 'relative', zIndex: 1 }}
      />
    </div>
  );
}