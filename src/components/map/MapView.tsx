import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Listing } from '@/types';
import { MILAN_UNIVERSITIES } from '@/data/universities';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  listings: Listing[];
  onListingHover?: (listingId: string | null) => void;
  onListingClick?: (listingId: string) => void;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
  className?: string;
}

// Custom marker icon for listings
const createCustomIcon = (isHovered: boolean, isSelected: boolean) => {
  const color = isSelected ? '#dc2626' : isHovered ? '#3b82f6' : '#059669';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transform: ${isHovered || isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: transform 0.2s ease;
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Custom marker icon for universities
const createUniversityIcon = () => {
  return L.divIcon({
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
};

function MapUpdater({ listings }: { listings: Listing[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (listings.length > 0) {
      try {
        const markers = listings.map(listing => L.marker([listing.lat, listing.lng]));
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      } catch (error) {
        console.error('Error fitting map bounds:', error);
      }
    }
  }, [listings, map]);

  return null;
}

export default function MapView({ 
  listings, 
  onListingHover, 
  onListingClick, 
  hoveredListingId,
  selectedListingId,
  className 
}: MapViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!listings || listings.length === 0) {
    return (
      <div className={`map-container ${className} flex items-center justify-center bg-muted`}>
        <p className="text-muted-foreground">No listings to display on map</p>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`}>
      <MapContainer
        center={[45.4642, 9.1900]} // Milan center
        zoom={13}
        className="w-full h-full"
        key={`map-${listings.length}`} // Force re-render when listings change
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater listings={listings} />
        
        {/* University Markers */}
        {MILAN_UNIVERSITIES.map((university) => (
          <Marker
            key={university.id}
            position={[university.lat, university.lng]}
            icon={createUniversityIcon()}
          >
            <Popup>
              <div className="w-48 p-2">
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-red-600">
                    🎓 {university.shortName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {university.name}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={createCustomIcon(
              hoveredListingId === listing.id,
              selectedListingId === listing.id
            )}
            eventHandlers={{
              mouseover: () => onListingHover?.(listing.id),
              mouseout: () => onListingHover?.(null),
              click: () => onListingClick?.(listing.id)
            }}
          >
            <Popup>
              <div className="w-64 p-2">
                <div className="flex items-start space-x-3">
                  {listing.images && listing.images[0] && (
                    <img 
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {listing.addressLine}
                    </p>
                    <div className="mt-2">
                      <span className="font-bold text-sm text-green-600">
                        {formatPrice(listing.rentMonthlyEUR)}/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}