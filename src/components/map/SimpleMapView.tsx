import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '@/types';
import { MILAN_UNIVERSITIES } from '@/data/universities';
import { loadLeafletCSS } from './leaflet-loader';
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
    loadLeafletCSS();
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
      
      // Group listings by robust normalized address + rounded coordinates to handle same-address cases reliably
      const normalizeAddress = (addr?: string) => {
        if (!addr) return '';
        return addr
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
          .replace(/[,..;:]/g, ' ') // remove punctuation
          .replace(/\b(it|italy|mi|milano)\b/g, '') // drop country/city suffixes if present
          .replace(/\b(via|v\.|viale|piazza|p\.)\b/g, '') // drop common prefixes
          .replace(/\s+/g, ' ')
          .trim();
      };
      const round = (n: number, p = 6) => Math.round(n * Math.pow(10, p)) / Math.pow(10, p);

      const groups = listings.reduce((acc, l) => {
        const coordKey = `${round(l.lat, 6)},${round(l.lng, 6)}`;
        const addressKey = normalizeAddress(l.addressLine);
        const key = addressKey ? `${addressKey}|${coordKey}` : coordKey;
        if (!acc[key]) acc[key] = [];
        acc[key].push(l);
        return acc;
      }, {} as Record<string, Listing[]>);

      Object.values(groups).forEach((group) => {
        if (group.length === 1) {
          const listing = group[0];
          const isHovered = hoveredListingId === listing.id;
          const price = formatPrice(listing.rentMonthlyEUR);

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
              e.originalEvent?.stopPropagation();
            });
            marker.on('mouseout', (e) => {
              onListingHover(null);
              e.originalEvent?.stopPropagation();
            });
          }

          markers.push(marker);
          return;
        }

        // Multiple listings at same address — show count + house icon and hover preview
        const avgLat = group.reduce((sum, l) => sum + l.lat, 0) / group.length;
        const avgLng = group.reduce((sum, l) => sum + l.lng, 0) / group.length;
        const isGroupHovered = hoveredListingId ? group.some(l => l.id === hoveredListingId) : false;

        const clusterIcon = L.divIcon({
          html: `
            <div style="
              background-color: ${isGroupHovered ? '#3b82f6' : '#059669'};
              border: 2px solid white;
              border-radius: 50%;
              width: 34px;
              height: 34px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 800;
              color: white;
              transform: ${isGroupHovered ? 'scale(1.1)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">${group.length}🏠</div>
          `,
          className: 'cluster-marker',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const groupMarker = L.marker([avgLat, avgLng], { icon: clusterIcon }).addTo(map);

        // Build interactive tooltip content listing all group items
        const tooltipHtml = `
          <div style="width: 320px; max-height: 260px; overflow-y: auto; padding: 8px;">
            <h3 style="font-weight: 600; font-size: 13px; margin: 0 0 8px 0; text-align: center;">${group.length} Properties at ${group[0].addressLine}</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${group.map((listing) => {
                const price = formatPrice(listing.rentMonthlyEUR);
                const img = listing.images && listing.images[0]
                  ? `<img src="${listing.images[0]}" alt="${listing.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" />`
                  : '<div style="width: 48px; height: 48px; background: #f3f4f6; border-radius: 6px; flex-shrink: 0;"></div>';
                return `
                  <div data-listing-id="${listing.id}" style="display: flex; align-items: start; gap: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; background: white; transition: all 0.2s ease;">
                    ${img}
                    <div style="flex: 1; min-width: 0;">
                      <div style="display:flex; align-items:center; justify-content:space-between; gap: 8px;">
                        <h4 style="font-weight: 600; font-size: 12px; margin: 0; line-height: 1.3; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${listing.title}</h4>
                        <div style="font-weight: 700; font-size: 12px; color: #059669;">${price}/mo</div>
                      </div>
                      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${listing.type || ''} ${listing.bedrooms ? `• ${listing.bedrooms} bed${listing.bedrooms !== 1 ? 's' : ''}` : ''}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;

        // Use a tooltip for hover preview that allows clicking on apartments
        groupMarker.bindTooltip(tooltipHtml, {
          permanent: false,
          direction: 'top',
          offset: [0, -18],
          className: 'group-hover-preview',
          interactive: true, // This allows clicking inside the tooltip
          opacity: 1
        });

        // Show tooltip on hover
        groupMarker.on('mouseover', () => {
          groupMarker.openTooltip();
        });

        // Keep tooltip open when hovering over the tooltip itself
        groupMarker.on('tooltipopen', () => {
          const tooltipEl = groupMarker.getTooltip()?.getElement();
          if (!tooltipEl) return;
          
          // Add event listeners to keep tooltip open when hovering over it
          tooltipEl.addEventListener('mouseenter', () => {
            groupMarker.openTooltip();
          });
          
          // Close tooltip when mouse leaves the tooltip area
          tooltipEl.addEventListener('mouseleave', () => {
            groupMarker.closeTooltip();
          });
          
          // Delegate click events inside tooltip to open selected listing
          if (onListingClick) {
            const items = tooltipEl.querySelectorAll('[data-listing-id]');
            items.forEach((item) => {
              const handler = (e: Event) => {
                e.stopPropagation();
                const id = (item as HTMLElement).getAttribute('data-listing-id');
                if (id) {
                  onListingClick(id);
                  groupMarker.closeTooltip();
                }
              };
              (item as HTMLElement).addEventListener('click', handler);
              // Store handler on element for cleanup
              (item as any).__handler = handler;
            });
          }
        });

        // Clean up event handlers when tooltip closes
        groupMarker.on('tooltipclose', () => {
          const tooltipEl = groupMarker.getTooltip()?.getElement();
          if (!tooltipEl) return;
          
          const items = tooltipEl.querySelectorAll('[data-listing-id]');
          items.forEach((item) => {
            const handler = (item as any).__handler;
            if (handler) (item as HTMLElement).removeEventListener('click', handler);
          });
        });

        // Close tooltip when mouse leaves marker (with small delay)
        let closeTimeout: NodeJS.Timeout;
        groupMarker.on('mouseout', () => {
          closeTimeout = setTimeout(() => {
            const tooltipEl = groupMarker.getTooltip()?.getElement();
            if (tooltipEl && !tooltipEl.matches(':hover')) {
              groupMarker.closeTooltip();
            }
          }, 100);
        });

        // Cancel close timeout if mouse re-enters marker
        groupMarker.on('mouseover', () => {
          if (closeTimeout) clearTimeout(closeTimeout);
        });

        if (onListingHover) {
          groupMarker.on('mouseover', (e) => {
            onListingHover(group[0].id);
            e.originalEvent?.stopPropagation();
          });
          groupMarker.on('mouseout', (e) => {
            onListingHover(null);
            e.originalEvent?.stopPropagation();
          });
        }

        markers.push(groupMarker);
      });

      // Add university markers
      MILAN_UNIVERSITIES.forEach((university) => {
        const universityIcon = L.divIcon({
          html: `
            <div style="
              background-color: #dc2626;
              border: 2px solid white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                background-color: white;
                border-radius: 50%;
                width: 6px;
                height: 6px;
              "></div>
            </div>
          `,
          className: 'university-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const universityMarker = L.marker([university.lat, university.lng], { icon: universityIcon })
          .addTo(map)
          .bindTooltip(`
            <div style="padding: 8px;">
              <div style="font-weight: 600; font-size: 13px; color: #dc2626; margin-bottom: 4px;">
                🎓 ${university.shortName}
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                ${university.name}
              </div>
            </div>
          `, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            className: 'university-tooltip'
          });

        markers.push(universityMarker);
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