import { useState } from 'react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Calendar, Wifi, Car, Users, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import ListingMap from '@/components/map/ListingMap';
import { useFavorites } from '@/hooks/useFavorites';

interface ListingCardProps {
  listing: Listing;
  onHover?: (listingId: string | null) => void;
  onClick?: (listingId: string) => void;
  isHovered?: boolean;
  className?: string;
}

export default function ListingCard({ 
  listing, 
  onHover, 
  onClick, 
  isHovered, 
  className 
}: ListingCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeDisplayName = (type: string) => {
    const types: Record<string, string> = {
      room: 'Room',
      studio: 'Studio',
      apartment: 'Apartment',
      flat: 'Flat'
    };
    return types[type] || type;
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
      'WiFi': <Wifi className="h-3 w-3" />,
      'Parking Space': <Car className="h-3 w-3" />,
      'Shared Kitchen': <Users className="h-3 w-3" />,
    };
    return icons[amenity];
  };

  return (
    <div 
      className={`listing-card ${isHovered ? 'scale-[1.02] border-primary/20' : ''} ${className}`}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(listing.id)}
    >
      {/* Image Gallery */}
      <div className="relative h-48 overflow-hidden">
        {listing.images.length > 0 && (
          <>
            <img 
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            
            {/* Image Navigation Dots */}
            {listing.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
        >
          <Heart 
            className={`h-4 w-4 ${
              isFavorited(listing.id) ? 'fill-favorite text-favorite' : 'text-muted-foreground'
            }`} 
          />
        </Button>

        {/* Type Badge */}
        <Badge className="absolute top-2 left-2 bg-background/90 text-foreground">
          {getTypeDisplayName(listing.type)}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-5 flex-1 mr-2">
            {listing.title}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-lg text-price">
              {formatPrice(listing.rentMonthlyEUR)}
            </div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{listing.addressLine}, {listing.city}</span>
          {listing.distance && (
            <span className="ml-auto text-xs">
              {listing.distance.toFixed(1)}km
            </span>
          )}
        </div>

        {/* Room Details */}
        <div className="flex items-center space-x-4 text-muted-foreground text-sm mb-3">
          {listing.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}</span>
            </div>
          )}
          {listing.bathrooms > 0 && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}</span>
            </div>
          )}
          {listing.sizeSqm && (
            <span>{listing.sizeSqm}m²</span>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center text-sm mb-3">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Available from</span>
          <span className="ml-1 font-medium text-foreground">
            {formatDate(listing.availabilityDate)}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {listing.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs py-0.5 px-2">
              {getAmenityIcon(amenity)}
              <span className="ml-1">{amenity}</span>
            </Badge>
          ))}
          {listing.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs py-0.5 px-2">
              +{listing.amenities.length - 3} more
            </Badge>
          )}
        </div>

        {/* Map Section */}
        {showMap && (
          <div className="mb-4">
            <ListingMap 
              lat={listing.lat} 
              lng={listing.lng} 
              address={`${listing.addressLine}, ${listing.city}`}
            />
          </div>
        )}

        {/* Agency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {listing.agency.logoUrl && (
              <img 
                src={listing.agency.logoUrl} 
                alt={listing.agency.name}
                className="w-6 h-6 rounded object-cover"
              />
            )}
            <span className="text-sm text-muted-foreground">{listing.agency.name}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMap(!showMap);
              }}
            >
              <Map className="h-4 w-4" />
            </Button>
            <Link to={`/listing/${listing.id}`}>
              <Button 
                size="sm" 
                className="hero-gradient text-white border-0 hover:opacity-90"
                onClick={(e) => e.stopPropagation()}
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}