import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { loadLeafletCSS } from './leaflet-loader';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ListingMapProps {
  lat: number;
  lng: number;
  address: string;
  className?: string;
}

// OpenStreetMap fallback component
const OpenStreetMapFallback = ({ lat, lng, address, className }: ListingMapProps) => {
  useEffect(() => {
    loadLeafletCSS();
  }, []);

  return (
    <div className={`relative ${className || 'h-64'}`}>
      <div className="absolute top-2 left-2 z-[1000] bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        Using OpenStreetMap fallback
      </div>
      <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-sm">
              <strong>Property Location</strong><br />
              {address}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default function ListingMap({ lat, lng, address, className }: ListingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat], // Mapbox uses [lng, lat]
        zoom: 15,
        interactive: false // Make it static for single listing view
      });

      // Add marker for the property
      new mapboxgl.Marker({
        color: '#3B82F6'
      })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <strong>Property Location</strong><br />
              ${address}
            </div>
          `)
        )
        .addTo(map.current);

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
      map.current?.remove();
    };
  }, [mapboxToken, lat, lng, address, mapError]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className || 'h-64'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  // Show error state or fallback to OpenStreetMap
  if (mapError || !mapboxToken) {
    console.log('Falling back to OpenStreetMap due to:', mapError || 'No Mapbox token');
    return <OpenStreetMapFallback lat={lat} lng={lng} address={address} className={className} />;
  }

  // Render Mapbox map
  return (
    <div className={`relative rounded-lg overflow-hidden border ${className || 'h-64'}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}