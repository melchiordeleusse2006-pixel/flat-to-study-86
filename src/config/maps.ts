// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  // Fallback API key for Google Maps JavaScript API
  // This is safe to store in the frontend since Google Maps JS API keys are public
  // and should be restricted by HTTP referrers in the Google Cloud Console
  fallbackApiKey: 'AIzaSyArfOzW8PcGQzjyPfUGz0J8G8dNFjeCJ64',
  
  // Default map options
  defaultCenter: { lat: 45.4642, lng: 9.1900 }, // Milan, Italy
  defaultZoom: 12,
  
  // Map styling
  mapStyles: [
    {
      featureType: 'all',
      elementType: 'geometry.fill',
      stylers: [{ color: '#f5f5f5' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9e2f6' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }]
    }
  ]
};